import { redirect } from 'next/navigation'
import AUMChart from '@/components/admin/AUMChart'
import { createClient } from '@/lib/supabase/server'
import { getCurrentInvestor } from '@/lib/supabase/currentInvestor'
import {
  summarizePositions,
  totalAccountValue,
  formatMoney,
} from '@/lib/portfolio'

export default async function PerformancePage() {
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
      <main className="text-white">
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

  const unrealizedRoi =
    summary.cost > 0
      ? ((summary.unrealized / summary.cost) * 100).toFixed(2)
      : '0.00'

  const chartData = (snapshots || []).map((s) => ({
    label: new Date(s.created_at).toLocaleDateString(
      undefined,
      { month: 'short', day: 'numeric' }
    ),
    value: Number(s.total_value) || 0,
  }))

  return (
    <main className="space-y-6">
      

      

      <h1 className="text-4xl font-bold text-cyan-400">
        Performance
      </h1>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="glass-card p-6">
          <div className="text-zinc-400">
            Total Account Value
          </div>
          <div className="text-3xl font-bold">
            {formatMoney(accountValue)}
          </div>
          <div className="text-xs text-zinc-600 mt-1">
            Cash + positions
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="text-zinc-400">
            Cost Basis
          </div>
          <div className="text-3xl font-bold">
            {formatMoney(summary.cost)}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="text-zinc-400">
            Unrealized P/L
          </div>
          <div
            className={`text-3xl font-bold ${
              summary.unrealized >= 0
                ? 'text-green-400'
                : 'text-red-400'
            }`}
          >
            {summary.unrealized >= 0 ? '+' : ''}
            {formatMoney(summary.unrealized)}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="text-zinc-400">
            Unrealized ROI
          </div>
          <div className="text-3xl font-bold text-cyan-400">
            {unrealizedRoi}%
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold mb-4">
          Account History
        </h2>

        <AUMChart data={chartData} />
      </div>
    </main>
  )
}
