import { createClient } from '@/lib/supabase/server'

export default async function InvestorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()

  const { data: investor } = await supabase
    .from('investors')
    .select('*')
    .eq('id', id)
    .single()

  const { data: transactions } = await supabase
    .from('investor_transactions')
    .select('*')
    .eq('investor_id', id)
    .order('created_at', {
      ascending: false,
    })

  const { data: positions } = await supabase
    .from('portfolio_positions')
    .select('*')
    .eq('investor_id', id)

  if (!investor) {
    return (
      <main className="p-8">
        Investor not found
      </main>
    )
  }

  return (
    <main className="space-y-8 p-8">
      <div>
        <h1 className="text-4xl font-bold text-cyan-400">
          {investor.full_name}
        </h1>

        <p className="text-zinc-400">
          {investor.email}
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <div className="text-zinc-500">
            Balance
          </div>

          <div className="text-2xl font-bold">
            $
            {Number(
              investor.balance || 0
            ).toLocaleString()}
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <div className="text-zinc-500">
            Invested
          </div>

          <div className="text-2xl font-bold">
            $
            {Number(
              investor.total_invested || 0
            ).toLocaleString()}
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <div className="text-zinc-500">
            Profit
          </div>

          <div className="text-2xl font-bold">
            $
            {Number(
              investor.total_profit || 0
            ).toLocaleString()}
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <div className="text-zinc-500">
            Status
          </div>

          <div className="text-2xl font-bold">
            {investor.status}
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Portfolio Holdings
        </h2>

        <div className="space-y-2">
          {positions?.map((position) => (
            <div
              key={position.id}
              className="flex justify-between"
            >
              <span>
                {position.asset}
              </span>

              <span>
                {position.quantity}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Transaction History
        </h2>

        <div className="space-y-3">
          {transactions?.map((tx) => (
            <div
              key={tx.id}
              className="flex justify-between border-b border-zinc-800 pb-2"
            >
              <div>
                {tx.transaction_type}
              </div>

              <div>
                $
                {Number(
                  tx.amount
                ).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
