import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { count: investorCount } = await supabase
      .from('investors')
      .select('*', { count: 'exact', head: true })

    // The `deposits` and `withdrawals` tables are never written by the app:
    // every deposit/withdrawal is recorded in `investor_transactions` and
    // rolled into `investors.balance` by the deposit/withdrawal/transaction
    // routes. Aggregate the ledger instead, or AUM is always $0.
    const { data: txs } = await supabase
      .from('investor_transactions')
      .select('amount, transaction_type')

    const sumBy = (txType: string) =>
      txs
        ?.filter((t) => t.transaction_type === txType)
        .reduce((sum, row) => sum + Number(row.amount || 0), 0) || 0

    const totalDeposits = sumBy('deposit')
    const totalWithdrawals = sumBy('withdrawal')

    const { count: transactionCount } = await supabase
      .from('investor_transactions')
      .select('*', { count: 'exact', head: true })

    const aum = totalDeposits - totalWithdrawals

    return NextResponse.json({
      investors: investorCount || 0,
      transactions: transactionCount || 0,
      deposits: totalDeposits,
      withdrawals: totalWithdrawals,
      aum,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json({
      investors: 0,
      transactions: 0,
      deposits: 0,
      withdrawals: 0,
      aum: 0,
    })
  }
}
