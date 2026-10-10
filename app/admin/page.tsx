import { requireAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

import AUMChart from '@/components/admin/AUMChart'
import AllocationChart from '@/components/admin/AllocationChart'
import StatCard from '@/components/admin/StatCard'

export default async function AdminPage() {
  await requireAdmin()
  const supabase = await createClient()

  const [
    { count: investorCount },
    { count: transactionCount },
    { data: investors },
    { data: transactions },
    { data: positions },
    { data: snapshots },
  ] = await Promise.all([
    supabase
      .from('investors')
      .select('*', {
        count: 'exact',
        head: true,
      }),

    supabase
      .from('investor_transactions')
      .select('*', {
        count: 'exact',
        head: true,
      }),

    supabase
      .from('investors')
      .select('*'),

    supabase
      .from('investor_transactions')
      .select('*')
      .order('created_at', {
        ascending: false,
      })
      .limit(10),

    supabase
      .from('portfolio_positions')
      .select('*'),

    supabase
      .from('portfolio_snapshots')
      .select('created_at, total_value')
      .order('created_at', { ascending: true })
      .limit(365),
  ])

  const cashTotal =
    investors?.reduce(
      (sum, investor) =>
        sum + Number(investor.balance || 0),
      0
    ) || 0

  const positionsValue =
    positions?.reduce(
      (sum, position) =>
        sum +
        Number(position.quantity) *
          Number(position.current_price || 0),
      0
    ) || 0

  // AUM = cash across all investors + positions at current market price.
  const totalAUM = cashTotal + positionsValue

  // Aggregate daily snapshots across investors for the AUM chart.
  const aumByDay = new Map<string, number>()
  for (const s of snapshots || []) {
    const day = new Date(s.created_at)
      .toISOString()
      .slice(0, 10)
    aumByDay.set(
      day,
      (aumByDay.get(day) || 0) +
        Number(s.total_value || 0)
    )
  }
  const aumChartData = [...aumByDay.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([day, value]) => ({
      label: new Date(day + 'T12:00:00').toLocaleDateString(
        undefined,
        { month: 'short', day: 'numeric' }
      ),
      value,
    }))

  const allocationMap: Record<
    string,
    number
  > = {}

  positions?.forEach((position) => {
    const value =
      Number(position.quantity) *
      Number(position.current_price || 0)

    allocationMap[position.asset] =
      (allocationMap[position.asset] || 0) +
      value
  })

  const allocationData =
    Object.entries(allocationMap).map(
      ([name, value]) => ({
        name,
        value,
      })
    )

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-cyan-400">
          Solid State Capital
        </h1>

        <p className="text-zinc-400 mt-2">
          Admin Dashboard
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <StatCard
          title="Investors"
          value={String(investorCount || 0)}
        />

        <StatCard
          title="Assets Under Management"
          value={`$${totalAUM.toLocaleString()}`}
        />

        <StatCard
          title="Transactions"
          value={String(
            transactionCount || 0
          )}
        />

        <StatCard
          title="Open Positions"
          value={String(
            positions?.length || 0
          )}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <Link
          href="/admin/investors/new"
          className="bg-cyan-500 text-black rounded-2xl p-6 font-bold text-center"
        >
          + Investor
        </Link>

        <Link
          href="/admin/deposits/new"
          className="bg-green-600 rounded-2xl p-6 font-bold text-center"
        >
          + Deposit
        </Link>

        <Link
          href="/admin/withdrawals/new"
          className="bg-orange-600 rounded-2xl p-6 font-bold text-center"
        >
          + Withdrawal
        </Link>

        <Link
          href="/admin/trading"
          className="bg-purple-600 rounded-2xl p-6 font-bold text-center"
        >
          Trading Panel
        </Link>

        <Link
          href="/admin/performance"
          className="bg-blue-600 rounded-2xl p-6 font-bold text-center"
        >
          Performance
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            AUM Growth
          </h2>

          <AUMChart data={aumChartData} />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            Portfolio Allocation
          </h2>

          <AllocationChart
            data={allocationData}
          />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Recent Activity
        </h2>

        <div className="space-y-3">
          {transactions?.map((tx) => (
            <div
              key={tx.id}
              className="flex justify-between border-b border-zinc-800 pb-3"
            >
              <div>
                <div className="capitalize font-medium">
                  {tx.transaction_type}
                </div>

                <div className="text-sm text-zinc-500">
                  {tx.notes ||
                    'No notes'}
                </div>
              </div>

              <div className="font-bold">
                $
                {Number(
                  tx.amount
                ).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
