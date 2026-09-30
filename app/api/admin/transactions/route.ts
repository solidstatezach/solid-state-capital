import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('investor_transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      investor_id,
      type,
      amount,
      notes,
    } = await req.json()

    const value = Number(amount)

    const { data: investor, error: investorError } =
      await supabase
        .from('investors')
        .select('*')
        .eq('id', investor_id)
        .single()

    if (investorError || !investor) {
      return NextResponse.json(
        { error: 'Investor not found' },
        { status: 404 }
      )
    }

    const { error: txError } = await supabase
      .from('investor_transactions')
      .insert({
        investor_id,
        type,
        amount: value,
        notes,
      })

    if (txError) throw txError

    let balance = Number(investor.balance || 0)
    let invested = Number(investor.total_invested || 0)
    let profit = Number(investor.total_profit || 0)

    switch (type) {
      case 'deposit':
        balance += value
        invested += value
        break

      case 'withdrawal':
        balance -= value
        break

      case 'profit':
        balance += value
        profit += value
        break

      case 'loss':
        balance -= value
        profit -= value
        break
    }

    const { error: updateError } = await supabase
      .from('investors')
      .update({
        balance,
        total_invested: invested,
        total_profit: profit,
      })
      .eq('id', investor_id)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error,
      },
      {
        status: 500,
      }
    )
  }
}
