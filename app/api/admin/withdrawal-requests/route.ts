import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getAdminClient() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return null

  return supabase
}

// List withdrawal requests (newest first), with investor details.
export async function GET() {
  const supabase = await getAdminClient()

  if (!supabase) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }

  const { data, error } = await supabase
    .from('withdrawal_requests')
    .select(
      'id, amount, wallet_address, status, created_at, investors (full_name, email)'
    )
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(data || [])
}

// Approve or reject a pending request.
// Approving records the withdrawal in the ledger and debits the investor.
export async function POST(req: Request) {
  const supabase = await getAdminClient()

  if (!supabase) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }

  const { id, action } = await req.json()

  if (!id || (action !== 'approved' && action !== 'rejected')) {
    return NextResponse.json(
      { error: 'Request id and action (approved|rejected) are required' },
      { status: 400 }
    )
  }

  const { data: request, error: fetchError } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !request) {
    return NextResponse.json(
      { error: 'Request not found' },
      { status: 404 }
    )
  }

  if (request.status !== 'pending') {
    return NextResponse.json(
      { error: `Request is already ${request.status}` },
      { status: 400 }
    )
  }

  if (action === 'rejected') {
    const { error } = await supabase
      .from('withdrawal_requests')
      .update({ status: 'rejected' })
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  }

  // approved: verify balance, record ledger entry, debit investor
  const { data: investor, error: investorError } = await supabase
    .from('investors')
    .select('id, balance')
    .eq('id', request.investor_id)
    .single()

  if (investorError || !investor) {
    return NextResponse.json(
      { error: 'Investor not found' },
      { status: 404 }
    )
  }

  const balance = Number(investor.balance || 0)
  const amount = Number(request.amount)

  if (balance < amount) {
    return NextResponse.json(
      { error: 'Insufficient investor balance' },
      { status: 400 }
    )
  }

  const { error: txError } = await supabase
    .from('investor_transactions')
    .insert({
      investor_id: request.investor_id,
      transaction_type: 'withdrawal',
      amount,
      notes: `Withdrawal request approved (wallet ${request.wallet_address})`,
    })

  if (txError) {
    return NextResponse.json(
      { error: txError.message },
      { status: 500 }
    )
  }

  const { error: updateError } = await supabase
    .from('investors')
    .update({ balance: balance - amount })
    .eq('id', request.investor_id)

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    )
  }

  const { error: statusError } = await supabase
    .from('withdrawal_requests')
    .update({ status: 'approved' })
    .eq('id', id)

  if (statusError) {
    return NextResponse.json(
      { error: statusError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
