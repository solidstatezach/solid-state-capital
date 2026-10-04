import { requireAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import StatCard from '@/components/admin/StatCard'

export default async function TradingPage() {
  const supabase = await createClient()

  const { data: positions } = await supabase
    .from('portfolio_positions')
    .select(`
      *,
      investors (
        full_name
      )
    `)

  const totalExposure =
    positions?.reduce(
      (sum, position) =>
        sum +
        Number(position.quantity) *
          Number(position.average_cost),
      0
    ) || 0

  return (
    <main className="space-y-8 p-8 text-white">
      <div>
        <h1 className="text-4xl font-bold text-cyan-400">
          Trading Desk
        </h1>

        <p className="text-zinc-400 mt-2">
          Portfolio management and execution
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard
          title="Total Exposure"
          value={`$${totalExposure.toLocaleString()}`}
        />

        <StatCard
          title="Open Positions"
          value={String(positions?.length || 0)}
        />

        <StatCard
          title="Assets Tracked"
          value={String(
            new Set(
              positions?.map((p) => p.asset)
            ).size || 0
          )}
        />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-800">
            <tr>
              <th className="p-4 text-left">
                Investor
              </th>

              <th className="p-4 text-left">
                Asset
              </th>

              <th className="p-4 text-left">
                Quantity
              </th>

              <th className="p-4 text-left">
                Avg Cost
              </th>

              <th className="p-4 text-left">
                Position Value
              </th>
            </tr>
          </thead>

          <tbody>
            {positions?.map((position) => (
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

                <td className="p-4">
                  {position.quantity}
                </td>

                <td className="p-4">
                  $
                  {Number(
                    position.average_cost
                  ).toLocaleString()}
                </td>

                <td className="p-4 text-cyan-400 font-bold">
                  $
                  {(
                    Number(position.quantity) *
                    Number(position.average_cost)
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
