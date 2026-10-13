import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'

/**
 * POST /api/webhooks/stripe
 * Stripe event webhook. Verifies Stripe's signature, then records card
 * deposits atomically via record_stripe_deposit() (idempotent per event).
 * Configure in the Stripe dashboard with the `checkout.session.completed`
 * event; the signing secret goes in STRIPE_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const key = process.env.STRIPE_SECRET_KEY

  if (!secret || !key) {
    return NextResponse.json(
      { error: 'Stripe is not configured on the server' },
      { status: 500 }
    )
  }

  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing Stripe signature' },
      { status: 400 }
    )
  }

  const stripe = new Stripe(key)

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      secret
    )
  } catch {
    return NextResponse.json(
      { error: 'Invalid Stripe signature' },
      { status: 400 }
    )
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const investorId = session.metadata?.investor_id
  const linkId = session.metadata?.deposit_link_id ?? null
  const amountTotal = session.amount_total

  if (!investorId || !amountTotal || amountTotal <= 0) {
    console.error(
      'stripe webhook: session missing investor metadata or amount',
      event.id
    )
    return NextResponse.json({ received: true })
  }

  const supabase = createServiceClient()

  const { data, error } = await supabase.rpc('record_stripe_deposit', {
    p_event_id: event.id,
    p_event_type: event.type,
    p_investor_id: investorId,
    p_amount: amountTotal / 100,
    p_session_id: session.id,
    p_link_id: linkId,
  })

  if (error) {
    console.error('stripe webhook: record_stripe_deposit failed', error.message)
    return NextResponse.json(
      { error: 'Failed to record deposit' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true, result: data })
}
