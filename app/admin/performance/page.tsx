import { createClient } from '@/lib/supabase/server'

export default async function PerformancePage() {
  const supabase = await createClient()

  const { data: positions } = await supabase
    .from('portfolio_positions')
    .select('*')

  const totalValue =
    positions?.reduce(
      (sum, p) =>
        sum +
        Number(p.quantity) *
        Number(p.average_cost),
      0
    ) || 0

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-cyan-400">
          Performance Dashboard
        </h1>

        <p className="text-zinc-400 mt-2">
          Portfolio valuation and holdings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="text-zinc-400">
            Portfolio Value
          </div>

          <div className="text-4xl font-bold mt-2">
            ${totalValue.toLocaleString()}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="text-zinc-400">
            Positions
          </div>

          <div className="text-4xl font-bold mt-2">
            {positions?.length || 0}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="text-zinc-400">
            Status
          </div>

          <div className="text-4xl font-bold mt-2 text-green-500">
            Live
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-800">
            <tr>
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
                  {position.asset}
                </td>

                <td className="p-4">
                  {position.quantity}
                </td>

                <td className="p-4">
                  ${Number(
                    position.average_cost
                  ).toLocaleString()}
                </td>

                <td className="p-4 font-bold">
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
