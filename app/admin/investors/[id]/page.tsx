import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AUMChart from '@/components/admin/AUMChart'
import AllocationChart from '@/components/admin/AllocationChart'

export default async function InvestorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()

  const { data: investor } = await supabase
    .from('investors')
    .select('*')
    .eq('id', id)
    .single()

  const { data: transactions } = await supabase
    .from('investor_transactions')
    .select('*')
    .eq('investor_id', id)
    .order('created_at', { ascending: false })

  if (!investor) {
    return <div>Investor not found</div>
  }

  const totalDeposits =
    transactions
      ?.filter((t) => t.transaction_type === 'deposit')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0

  const totalWithdrawals =
    transactions
      ?.filter((t) => t.transaction_type === 'withdrawal')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-cyan-400">
          {investor.full_name}
        </h1>

        <p className="text-zinc-400">
          Investor Profile
        </p>

        <div className="flex gap-3 mt-4 flex-wrap">
          <Link
            href="/admin/deposits/new"
            className="bg-green-600 px-4 py-2 rounded-lg"
          >
            New Deposit
          </Link>

          <Link
            href="/admin/withdrawals/new"
            className="bg-red-600 px-4 py-2 rounded-lg"
          >
            New Withdrawal
          </Link>

          <button className="bg-cyan-600 px-4 py-2 rounded-lg">
            Add Profit
          </button>

          <button className="bg-yellow-600 px-4 py-2 rounded-lg">
            Edit Investor
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <div className="text-zinc-400">Balance</div>

          <div className="text-3xl font-bold mt-2">
            ${Number(investor.balance).toLocaleString()}
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <div className="text-zinc-400">Total Invested</div>

          <div className="text-3xl font-bold mt-2">
            ${Number(
              investor.total_invested
            ).toLocaleString()}
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <div className="text-zinc-400">Total Profit</div>

          <div className="text-3xl font-bold mt-2">
            ${Number(
              investor.total_profit
            ).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <div className="text-zinc-400">
            Lifetime Deposits
          </div>

          <div className="text-3xl font-bold mt-2">
            ${totalDeposits.toLocaleString()}
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <div className="text-zinc-400">
            Lifetime Withdrawals
          </div>

          <div className="text-3xl font-bold mt-2">
            ${totalWithdrawals.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-xl font-bold mb-4">
            AUM Growth
          </h2>

          <AUMChart />
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-xl font-bold mb-4">
            Portfolio Allocation
          </h2>

          <AllocationChart />
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
        <h2 className="text-2xl font-bold mb-6">
          Transaction History
        </h2>

        <div className="space-y-3">
          {transactions?.map((tx) => (
            <div
              key={tx.id}
              className="flex justify-between border-b border-zinc-800 pb-3"
            >
              <div>
                <div className="font-medium capitalize">
                  {tx.transaction_type}
                </div>

                <div className="text-sm text-zinc-500">
                  {tx.notes || 'No notes'}
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold">
                  ${Number(tx.amount).toLocaleString()}
                </div>

                <div className="text-xs text-zinc-500">
                  {new Date(
                    tx.created_at
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
