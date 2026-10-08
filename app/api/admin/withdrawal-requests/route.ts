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
// Runs atomically inside a single Postgres transaction via
// public.resolve_withdrawal_request, so double-clicks, two admins, or a
// retried request can never pay out twice.
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

  // Single atomic call: pending check, balance lock, ledger entry, debit,
  // and status change all happen inside one transaction. A second concurrent
  // attempt fails with "Request is already approved/rejected".
  const { error } = await supabase.rpc('resolve_withdrawal_request', {
    request_id: id,
    p_action: action,
  })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}
