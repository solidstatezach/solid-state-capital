import { createClient } from '@/lib/supabase/server'

export default async function PortfolioPage() {
  const supabase = await createClient()

  const { data: positions, error } =
    await supabase
      .from('portfolio_positions')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold text-red-500">
          Error Loading Portfolio
        </h1>

        <p>{error.message}</p>
      </main>
    )
  }

  const totalValue =
    positions?.reduce((sum, position) => {
      return (
        sum +
        Number(position.quantity) *
          Number(position.average_cost)
      )
    }, 0) || 0

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-cyan-400">
          Portfolio
        </h1>

        <p className="text-zinc-400 mt-2">
          Live portfolio holdings
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-2">
          Total Portfolio Value
        </h2>

        <div className="text-5xl font-bold text-green-400">
          ${totalValue.toLocaleString()}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-x-auto">
        <table className="min-w-[700px] w-full">
          <thead className="bg-zinc-800">
            <tr>
              <th className="text-left p-4">
                Asset
              </th>

              <th className="text-left p-4">
                Quantity
              </th>

              <th className="text-left p-4">
                Avg Cost
              </th>

              <th className="text-left p-4">
                Position Value
              </th>
            </tr>
          </thead>

          <tbody>
            {positions?.map((position) => {
              const value =
                Number(position.quantity) *
                Number(position.average_cost)

              return (
                <tr
                  key={position.id}
                  className="border-t border-zinc-800"
                >
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

                  <td className="p-4 text-green-400">
                    ${value.toLocaleString()}
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
