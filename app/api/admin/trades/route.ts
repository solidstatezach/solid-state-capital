import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/admin/trades — execute a buy/sell atomically via
// public.execute_trade(). The DB function itself enforces the admin
// check (public.is_admin()), so this route is safe to expose to any
// authenticated caller: non-admins get a clean 400 from the function.
export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    investor_id,
    asset,
    side,
    quantity,
    price,
    notes,
  } = await req.json()

  if (!investor_id || !asset || !side || !quantity || !price) {
    return NextResponse.json(
      {
        error:
          'investor_id, asset, side, quantity, and price are required',
      },
      { status: 400 }
    )
  }

  const { data, error } = await supabase.rpc('execute_trade', {
    p_investor_id: investor_id,
    p_asset: String(asset).trim(),
    p_side: String(side).toLowerCase(),
    p_quantity: Number(quantity),
    p_price: Number(price),
    p_notes: notes ? String(notes) : null,
  })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json(data)
}
