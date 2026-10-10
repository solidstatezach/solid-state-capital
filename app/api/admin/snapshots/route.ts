import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/supabase/audit'

// GET /api/admin/snapshots?investor_id=… — valuation history.
// RLS restricts investors to their own rows; admins see all.
export async function GET(req: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const investorId = searchParams.get('investor_id')

  let query = supabase
    .from('portfolio_snapshots')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(365)

  if (investorId) {
    query = query.eq('investor_id', investorId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(data || [])
}

// POST /api/admin/snapshots — record today's valuation snapshot for
// every investor (idempotent per investor per day). RLS restricts to
// admins.
export async function POST() {
  const supabase = await createClient()

  const { data: investors, error: investorsError } = await supabase
    .from('investors')
    .select('id, balance')

  if (investorsError) {
    return NextResponse.json(
      { error: investorsError.message },
      { status: 500 }
    )
  }

  const { data: positions, error: positionsError } = await supabase
    .from('portfolio_positions')
    .select('investor_id, quantity, average_cost, current_price')

  if (positionsError) {
    return NextResponse.json(
      { error: positionsError.message },
      { status: 500 }
    )
  }

  const byInvestor = new Map<string, { cost: number; value: number }>()
  for (const p of positions || []) {
    const qty = Number(p.quantity) || 0
    const entry = byInvestor.get(p.investor_id) || { cost: 0, value: 0 }
    entry.cost += qty * (Number(p.average_cost) || 0)
    entry.value += qty * (Number(p.current_price) || 0)
    byInvestor.set(p.investor_id, entry)
  }

  const rows = (investors || []).map((inv) => {
    const cash = Number(inv.balance) || 0
    const agg = byInvestor.get(inv.id) || { cost: 0, value: 0 }
    return {
      investor_id: inv.id,
      cash_balance: cash,
      total_cost: cash + agg.cost,
      total_value: cash + agg.value,
    }
  })

  if (rows.length === 0) {
    return NextResponse.json({ success: true, recorded: 0 })
  }

  // Idempotent: replace any snapshots already recorded today, then
  // insert fresh. (The unique index is on (investor_id, created_at::date),
  // which the JS client's onConflict cannot target directly.)
  const dayStart = new Date()
  dayStart.setUTCHours(0, 0, 0, 0)

  const { data: existing } = await supabase
    .from('portfolio_snapshots')
    .select('id')
    .gte('created_at', dayStart.toISOString())

  if (existing && existing.length > 0) {
    const { error: deleteError } = await supabase
      .from('portfolio_snapshots')
      .delete()
      .in(
        'id',
        existing.map((r) => r.id)
      )

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }
  }

  const { error: insertError } = await supabase
    .from('portfolio_snapshots')
    .insert(rows)

  if (insertError) {
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 }
    )
  }

  await logAudit(supabase, {
    action: 'snapshots.record',
    entity: 'portfolio_snapshots',
    after: { recorded: rows.length },
    notes: 'Daily valuation snapshots recorded',
  })

  return NextResponse.json({ success: true, recorded: rows.length })
}
