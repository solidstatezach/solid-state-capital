import { requireAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import SnapshotChart from './SnapshotChart'
import RecordSnapshotButton from './RecordSnapshotButton'

const money = (n: number) =>
  `$${Number(n || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`

export default async function PerformancePage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: positions } = await supabase
    .from('portfolio_positions')
    .select('*, investors ( full_name )')
    .order('asset')

  const { data: investors } = await supabase
    .from('investors')
    .select('balance')

  const { data: snapshots } = await supabase
    .from('portfolio_snapshots')
    .select('created_at, total_value')
    .order('created_at', { ascending: true })
    .limit(365)

  // Aggregate snapshots across investors into one series per day
  const byDay = new Map<string, number>()
  for (const s of snapshots || []) {
    const day = new Date(s.created_at).toISOString().slice(0, 10)
    byDay.set(day, (byDay.get(day) || 0) + Number(s.total_value || 0))
  }
  const series = [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([day, total_value]) => ({
      created_at: day,
      total_value,
    }))

  const cash = (investors || []).reduce(
    (sum, i) => sum + (Number(i.balance) || 0),
    0
  )

  let positionsValue = 0
  let positionsCost = 0
  for (const p of positions || []) {
    const qty = Number(p.quantity) || 0
    positionsValue += qty * (Number(p.current_price) || 0)
    positionsCost += qty * (Number(p.average_cost) || 0)
  }

  const totalValue = cash + positionsValue
  const unrealized = positionsValue - positionsCost

  return (
    <main className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-cyan-400">
            Performance Dashboard
          </h1>

          <p className="text-zinc-400 mt-2">
            Portfolio valuation and holdings
          </p>
        </div>

        <RecordSnapshotButton />
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="text-zinc-400">Total Value</div>

          <div className="text-4xl font-bold mt-2">
            {money(totalValue)}
          </div>

          <div className="text-xs text-zinc-500 mt-1">
            Cash + positions at current price
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="text-zinc-400">Unrealized P/L</div>

          <div
            className={`text-4xl font-bold mt-2 ${
              unrealized >= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {unrealized >= 0 ? '+' : ''}
            {money(unrealized)}
          </div>

          <div className="text-xs text-zinc-500 mt-1">
            Current price vs average cost
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="text-zinc-400">Cash</div>

          <div className="text-4xl font-bold mt-2">
            {money(cash)}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="text-zinc-400">Positions</div>

          <div className="text-4xl font-bold mt-2">
            {positions?.length || 0}
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Valuation History
        </h2>

        <SnapshotChart snapshots={series} />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-800">
            <tr>
              <th className="p-4 text-left">Investor</th>
              <th className="p-4 text-left">Asset</th>
              <th className="p-4 text-left">Quantity</th>
              <th className="p-4 text-left">Avg Cost</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Value</th>
              <th className="p-4 text-left">Unrealized</th>
            </tr>
          </thead>

          <tbody>
            {positions?.map((position) => {
              const qty = Number(position.quantity) || 0
              const avg = Number(position.average_cost) || 0
              const price = Number(position.current_price) || 0
              const upl = qty * (price - avg)

              return (
                <tr
                  key={position.id}
                  className="border-t border-zinc-800"
                >
                  <td className="p-4">
                    {position.investors?.full_name}
                  </td>

                  <td className="p-4 font-bold">
                    {position.asset}
                  </td>

                  <td className="p-4">{qty}</td>

                  <td className="p-4">{money(avg)}</td>

                  <td className="p-4">{money(price)}</td>

                  <td className="p-4 text-cyan-400 font-bold">
                    {money(qty * price)}
                  </td>

                  <td
                    className={`p-4 font-bold ${
                      upl >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {upl >= 0 ? '+' : ''}
                    {money(upl)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
