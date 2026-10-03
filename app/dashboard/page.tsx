import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatCard from '@/components/admin/StatCard'
import AUMChart from '@/components/admin/AUMChart'
import AllocationChart from '@/components/admin/AllocationChart'
import MarketTicker from '@/components/investor/MarketTicker'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: positions } = await supabase
    .from('portfolio_positions')
    .select('*')

  const { data: transactions } = await supabase
    .from('investor_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  const portfolioValue =
    positions?.reduce(
      (sum, p) =>
        sum +
        Number(p.quantity) *
        Number(p.current_price || 0),
      0
    ) || 0

  const totalInvested =
    positions?.reduce(
      (sum, p) =>
        sum +
        Number(p.quantity) *
        Number(p.average_cost || 0),
      0
    ) || 0

  const totalProfit = portfolioValue - totalInvested

  const allocationData =
    positions?.map((p) => ({
      name: p.asset,
      value:
        Number(p.quantity) *
        Number(p.current_price || 0),
    })) || []

  return (
    <main className="p-8 text-white space-y-8">
      <div>
        <h1 className="text-5xl font-black text-cyan-400">
          Investor Dashboard
        </h1>

        <MarketTicker />

        <p className="text-zinc-400 mt-2">
          Portfolio Overview
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            href="/investor/transactions"
            className="px-5 py-3 rounded-xl bg-cyan-500 text-black font-bold"
          >
            Deposit
          </Link>

          <Link
            href="/investor/withdraw"
            className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700"
          >
            Withdraw
          </Link>

          <Link
            href="/investor/portfolio"
            className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700"
          >
            Portfolio
          </Link>
        </div>
      </div>

      <div className="glass-card p-8 rounded-3xl">
        <p className="text-zinc-500 uppercase tracking-wider text-sm">
          Portfolio Value
        </p>

        <h2 className="text-6xl font-black metric-glow mt-3">
          ${portfolioValue.toLocaleString()}
        </h2>

        <p className="text-green-400 mt-3">
          Active Account
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel-hover">
          <StatCard
            title="Total Invested"
            value={`$${totalInvested.toLocaleString()}`}
          />
        </div>

        <div className="panel-hover">
          <StatCard
            title="Total Profit"
            value={`$${totalProfit.toLocaleString()}`}
            valueClassName="text-green-400"
          />
        </div>

        <div className="panel-hover">
          <StatCard
            title="Account Status"
            value="Active"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-4">
            Portfolio Growth
          </h2>

          <AUMChart />
        </div>

        <AllocationChart data={allocationData} />
      </div>

      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold mb-4">
          Recent Transactions
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
                  {tx.notes || 'No notes'}
                </div>
              </div>

              <div className="font-bold">
                ${Number(tx.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
