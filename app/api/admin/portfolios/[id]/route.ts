import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/supabase/audit'

// PUT /api/admin/portfolios/:id — update quantity / average_cost / current_price.
// RLS ("Admins can manage positions") restricts this to admins.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { quantity, average_cost, current_price } = await req.json()

  const { data: before } = await supabase
    .from('portfolio_positions')
    .select('*')
    .eq('id', id)
    .single()

  if (!before) {
    return NextResponse.json(
      { error: 'Position not found' },
      { status: 404 }
    )
  }

  const patch: Record<string, number> = {}
  if (quantity !== undefined) patch.quantity = Number(quantity)
  if (average_cost !== undefined)
    patch.average_cost = Number(average_cost)
  if (current_price !== undefined)
    patch.current_price = Number(current_price)

  const { data: after, error } = await supabase
    .from('portfolio_positions')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  await logAudit(supabase, {
    action: 'position.update',
    entity: 'portfolio_positions',
    entity_id: id,
    before,
    after,
  })

  return NextResponse.json({ success: true, position: after })
}

// DELETE /api/admin/portfolios/:id — remove a position.
// RLS ("Admins can manage positions") restricts this to admins.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: before } = await supabase
    .from('portfolio_positions')
    .select('*')
    .eq('id', id)
    .single()

  if (!before) {
    return NextResponse.json(
      { error: 'Position not found' },
      { status: 404 }
    )
  }

  const { error } = await supabase
    .from('portfolio_positions')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  await logAudit(supabase, {
    action: 'position.delete',
    entity: 'portfolio_positions',
    entity_id: id,
    before,
  })

  return NextResponse.json({ success: true })
}
