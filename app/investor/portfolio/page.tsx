import MarketTicker from '@/components/investor/MarketTicker'
import { createClient } from '@/lib/supabase/server'
import { getCurrentInvestor } from '@/lib/supabase/currentInvestor'
import Nav from '@/components/investor/Nav'

export default async function PortfolioPage() {
  const supabase = await createClient()

  const investor = await getCurrentInvestor()

  if (!investor) {
    return (
      <main className="p-6">
        <Nav />
        <h1 className="text-2xl font-bold text-red-500">
          Investor not found
        </h1>
      </main>
    )
  }

  const { data: positions, error } = await supabase
    .from('portfolio_positions')
    .select('*')
    .eq('investor_id', investor.id)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="p-6">
        <Nav />
        <MarketTicker />
        <h1 className="text-2xl font-bold text-red-500">
          Error Loading Portfolio
        </h1>
        <p>{error.message}</p>
      </main>
    )
  }

  const totalValue =
    positions?.reduce(
      (sum, p) =>
        sum +
        Number(p.quantity) *
          Number(p.current_price || 0),
      0
    ) || 0

  return (
    <main className="space-y-8">
      <Nav />

      <div>
        <h1 className="text-4xl font-bold text-cyan-400">
          Portfolio
        </h1>

        <p className="text-zinc-400 mt-2">
          Live portfolio holdings
        </p>
      </div>

      <MarketTicker />

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-2">
          Total Portfolio Value
        </h2>

        <div className="text-5xl font-bold text-green-400">
          ${totalValue.toLocaleString()}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-x-auto">
        <table className="min-w-[1000px] w-full">
          <thead className="bg-zinc-800">
            <tr>
              <th className="text-left p-4">Asset</th>
              <th className="text-left p-4">Quantity</th>
              <th className="text-left p-4">Avg Cost</th>
              <th className="text-left p-4">Current Price</th>
              <th className="text-left p-4">Value</th>
              <th className="text-left p-4">P/L</th>
            </tr>
          </thead>

          <tbody>
            {positions?.map((position) => {
              const value =
                Number(position.quantity) *
                Number(position.current_price || 0)

              const invested =
                Number(position.quantity) *
                Number(position.average_cost || 0)

              const profit = value - invested

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

                  <td className="p-4">
                    $
                    {Number(
                      position.current_price
                    ).toLocaleString()}
                  </td>

                  <td className="p-4 text-cyan-400">
                    ${value.toLocaleString()}
                  </td>

                  <td
                    className={`p-4 font-bold ${
                      profit >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    ${profit.toLocaleString()}
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
