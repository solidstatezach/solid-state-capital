import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentInvestor } from '@/lib/supabase/currentInvestor'
import {
  summarizePositions,
  totalAccountValue,
  formatMoney,
} from '@/lib/portfolio'
import StatCard from '@/components/admin/StatCard'
import AUMChart from '@/components/admin/AUMChart'
import AllocationChart from '@/components/admin/AllocationChart'
import MarketTicker from '@/components/investor/MarketTicker'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const investor = await getCurrentInvestor()

  if (!investor) {
    return (
      <main className="p-8 text-white">
        <h1 className="text-3xl font-bold text-red-500">
          Investor not found
        </h1>

        <p className="text-zinc-400 mt-2">
          Your account is not linked to an investor profile yet.
          Please contact your administrator.
        </p>
      </main>
    )
  }

  const { data: positions } = await supabase
    .from('portfolio_positions')
    .select('*')
    .eq('investor_id', investor.id)

  const { data: transactions } = await supabase
    .from('investor_transactions')
    .select('*')
    .eq('investor_id', investor.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: snapshots } = await supabase
    .from('portfolio_snapshots')
    .select('created_at, total_value')
    .eq('investor_id', investor.id)
    .order('created_at', { ascending: true })
    .limit(365)

  const summary = summarizePositions(positions)
  const accountValue = totalAccountValue(
    investor.balance,
    positions
  )

  const chartData = (snapshots || []).map((s) => ({
    label: new Date(s.created_at).toLocaleDateString(
      undefined,
      { month: 'short', day: 'numeric' }
    ),
    value: Number(s.total_value) || 0,
  }))

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
            Transactions
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
          Total Account Value
        </p>

        <h2 className="text-6xl font-black metric-glow mt-3">
          {formatMoney(accountValue)}
        </h2>

        <p className="text-zinc-400 mt-3">
          {investor.full_name} · Cash{' '}
          {formatMoney(investor.balance)} + Positions{' '}
          {formatMoney(summary.value)}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel-hover">
          <StatCard
            title="Cost Basis"
            value={formatMoney(summary.cost)}
          />
        </div>

        <div className="panel-hover">
          <StatCard
            title="Unrealized P/L"
            value={`${summary.unrealized >= 0 ? '+' : ''}${formatMoney(
              summary.unrealized
            )}`}
            valueClassName={
              summary.unrealized >= 0
                ? 'text-green-400'
                : 'text-red-400'
            }
          />
        </div>

        <div className="panel-hover">
          <StatCard
            title="Account Status"
            value={investor.status || 'Active'}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-4">
            Account History
          </h2>

          <AUMChart data={chartData} />
        </div>

        <AllocationChart data={allocationData} />
      </div>

      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold mb-4">
          Recent Transactions
        </h2>

        {transactions && transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx) => (
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
                  {formatMoney(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500">
            No transactions yet.
          </p>
        )}
      </div>
    </main>
  )
}
