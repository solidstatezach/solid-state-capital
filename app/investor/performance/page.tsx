import MarketTicker from '@/components/investor/MarketTicker'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/investor/Nav'

export default async function PerformancePage() {
  const supabase = await createClient()

  const { data: investor } = await supabase
    .from('investors')
    .select('*')
    .single()

  const totalInvested = Number(investor?.total_invested || 0)
  const totalProfit = Number(investor?.total_profit || 0)

  const portfolioValue = totalInvested + totalProfit

  const roi =
    totalInvested > 0
      ? ((totalProfit / totalInvested) * 100).toFixed(2)
      : '0.00'

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <Nav />
      <MarketTicker />

      <h1 className="text-4xl font-bold text-cyan-400">
        Performance
      </h1>

      <div className="grid gap-6 md:grid-cols-4">

        <div className="glass-card p-6">
          <div className="text-zinc-400">Portfolio Value</div>
          <div className="text-3xl font-bold">
            ${portfolioValue.toLocaleString()}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="text-zinc-400">Total Invested</div>
          <div className="text-3xl font-bold">
            ${totalInvested.toLocaleString()}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="text-zinc-400">Total Profit</div>
          <div className="text-3xl font-bold text-green-400">
            ${totalProfit.toLocaleString()}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="text-zinc-400">ROI</div>
          <div className="text-3xl font-bold text-cyan-400">
            {roi}%
          </div>
        </div>

      </div>
    </main>
  )
}
