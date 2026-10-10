import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/supabase/audit'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('portfolio_positions')
    .select(`
      *,
      investors (
        full_name
      )
    `)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(data || [])
}

export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    investor_id,
    asset,
    quantity,
    average_cost,
  } = await req.json()

  const { data, error } = await supabase
    .from('portfolio_positions')
    .insert({
      investor_id,
      asset,
      quantity,
      average_cost,
      current_price: average_cost,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  await logAudit(supabase, {
    action: 'position.create',
    entity: 'portfolio_positions',
    entity_id: data?.id,
    after: data,
  })

  return NextResponse.json({
    success: true,
  })
}
