import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const body = await req.json()

    const { investor_id, amount } = body

    // Create deposit record
    const { error: depositError } = await supabase
      .from('deposits')
      .insert([
        {
          investor_id,
          amount,
          status: 'completed',
        },
      ])

    if (depositError) {
      throw depositError
    }

    // Get investor
    const { data: investor, error: investorError } =
      await supabase
        .from('investors')
        .select('balance,total_invested')
        .eq('id', investor_id)
        .single()

    if (investorError) {
      throw investorError
    }

    // Update balances
    const { error: updateError } = await supabase
      .from('investors')
      .update({
        balance:
          Number(investor.balance) + Number(amount),

        total_invested:
          Number(investor.total_invested) +
          Number(amount),
      })
      .eq('id', investor_id)

    if (updateError) {
      throw updateError
    }

    // Create ledger entry
    const { error: transactionError } =
      await supabase
        .from('investor_transactions')
        .insert([
          {
            investor_id,
            transaction_type: 'deposit',
            amount,
            notes: 'Admin deposit',
          },
        ])

    if (transactionError) {
      throw transactionError
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
