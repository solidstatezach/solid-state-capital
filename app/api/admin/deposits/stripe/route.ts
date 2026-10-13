import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

async function getAdminClient() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (error || !profile?.is_admin) return null
  return supabase
}

/**
 * POST /api/admin/deposits/stripe
 * Admin-only. Creates a Stripe Checkout Session for a card deposit and
 * returns the hosted payment URL to send to the investor. The balance is
 * credited by the Stripe webhook (/api/webhooks/stripe) after payment.
 */
export async function POST(req: Request) {
  try {
    const supabase = await getAdminClient()

    if (!supabase) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured on the server' },
        { status: 500 }
      )
    }

    const { investorId, amount } = await req.json()

    if (!investorId || !amount) {
      return NextResponse.json(
        { error: 'Investor ID and amount are required' },
        { status: 400 }
      )
    }

    const amountCents = Math.round(Number(amount) * 100)

    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    const { data: investor, error: investorError } = await supabase
      .from('investors')
      .select('id, full_name, email')
      .eq('id', investorId)
      .maybeSingle()

    if (investorError) {
      return NextResponse.json(
        { error: investorError.message },
        { status: 500 }
      )
    }

    if (!investor) {
      return NextResponse.json(
        { error: `Investor not found: ${investorId}` },
        { status: 404 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const origin =
      req.headers.get('origin') ??
      'https://solid-state-capital-1iw3ponau-zachary-knoles-projects.vercel.app'

    const { data: link, error: linkError } = await supabase
      .from('stripe_deposit_links')
      .insert({
        investor_id: investorId,
        amount_cents: amountCents,
      })
      .select('id')
      .single()

    if (linkError || !link) {
      return NextResponse.json(
        { error: linkError?.message ?? 'Could not create deposit link' },
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
        investor_id: investorId,
        deposit_link_id: link.id,
      },
      success_url: `${origin}/login?deposit=success`,
      cancel_url: `${origin}/login?deposit=cancelled`,
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
