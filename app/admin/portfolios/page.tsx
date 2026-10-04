import { requireAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export default async function PortfoliosPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: positions } = await supabase
    .from('portfolio_positions')
    .select(`
      *,
      investors (
        full_name
      )
    `)

  return (
    <main className="space-y-8">
      <h1 className="text-4xl font-bold text-cyan-400">
        Portfolio Positions
      </h1>

      <div className="bg-zinc-900 rounded-2xl overflow-hidden">
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

                <td className="p-4">
                  {position.asset}
                </td>

                <td className="p-4">
                  {position.quantity}
                </td>

                <td className="p-4">
                  ${position.average_cost}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
