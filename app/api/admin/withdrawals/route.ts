import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getAdminClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (error || !profile?.is_admin) return null
  return supabase
}

export async function GET() {
  const supabase = await getAdminClient()

  if (!supabase) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('investor_transactions')
    .select('*')
    .eq('transaction_type', 'withdrawal')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  const supabase = await getAdminClient()

  if (!supabase) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const investorId = body.investorId
    const amount = Number(body.amount)

    if (
      typeof investorId !== 'string' ||
      !investorId.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        { error: 'A valid investor ID and positive amount are required' },
        { status: 400 }
      )
    }

    const { data: investor, error: investorError } = await supabase
      .from('investors')
      .select('id, balance')
      .eq('id', investorId)
      .maybeSingle()

    if (investorError) {
      return NextResponse.json({ error: investorError.message }, { status: 500 })
    }

    if (!investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
    }

    const balance = Number(investor.balance ?? 0)

    if (balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    return NextResponse.json(
      {
        error:
          'Manual withdrawals are temporarily disabled. Use the withdrawal request approval workflow to ensure atomic balance updates.',
      },
      { status: 409 }
    )
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
