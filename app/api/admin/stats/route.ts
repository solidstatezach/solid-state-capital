import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { count: investorCount } = await supabase
      .from('investors')
      .select('*', { count: 'exact', head: true })

    const { data: deposits } = await supabase
      .from('deposits')
      .select('amount')

    const { data: withdrawals } = await supabase
      .from('withdrawals')
      .select('amount')

    const { count: transactionCount } = await supabase
      .from('investor_transactions')
      .select('*', { count: 'exact', head: true })

    const totalDeposits =
      deposits?.reduce(
        (sum, row) => sum + Number(row.amount || 0),
        0
      ) || 0

    const totalWithdrawals =
      withdrawals?.reduce(
        (sum, row) => sum + Number(row.amount || 0),
        0
      ) || 0

    const aum =
      totalDeposits - totalWithdrawals

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
