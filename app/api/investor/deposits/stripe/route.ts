import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getCurrentInvestor } from '@/lib/supabase/currentInvestor'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * POST /api/investor/deposits/stripe
 * Investor self-serve card deposit. The investor is taken from the login
 * session — never from the request body — so an investor can only ever
 * create a deposit for themselves. Returns the Stripe hosted payment URL.
 * The balance is credited by the Stripe webhook (/api/webhooks/stripe).
 */
export async function POST(req: Request) {
  try {
    const investor = await getCurrentInvestor()

    if (!investor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Card deposits are not enabled yet' },
        { status: 500 }
      )
    }

    const { amount } = await req.json()
    const amountCents = Math.round(Number(amount) * 100)

    if (!Number.isFinite(amountCents) || amountCents < 100) {
      return NextResponse.json(
        { error: 'Amount must be at least $1' },
        { status: 400 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const origin =
      req.headers.get('origin') ??
      'https://solid-state-capital-1iw3ponau-zachary-knoles-projects.vercel.app'

    // Service client: the investor is already authenticated above, and the
    // link-tracking table is admin/write-restricted under RLS.
    const supabase = createServiceClient()

    const { data: link, error: linkError } = await supabase
      .from('stripe_deposit_links')
      .insert({
        investor_id: investor.id,
        amount_cents: amountCents,
      })
      .select('id')
      .single()

    if (linkError || !link) {
      return NextResponse.json(
        { error: linkError?.message ?? 'Could not start deposit' },
        { status: 500 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // Deposits are capital contributions, not taxable sales — opt out of
      // Stripe's Managed Payments (which would require a product tax code).
      managed_payments: { enabled: false },
      customer_email: investor.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: `Solid State Capital — Deposit (${investor.full_name})`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        investor_id: investor.id,
        deposit_link_id: link.id,
      },
      success_url: `${origin}/investor/deposit?deposit=success`,
      cancel_url: `${origin}/investor/deposit?deposit=cancelled`,
    })

    await supabase
      .from('stripe_deposit_links')
      .update({ stripe_session_id: session.id, url: session.url })
      .eq('id', link.id)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
