import MarketTicker from '@/components/investor/MarketTicker'
import { createClient } from '@/lib/supabase/server'
import { getCurrentInvestor } from '@/lib/supabase/currentInvestor'
import Nav from '@/components/investor/Nav'

export default async function TransactionsPage() {
  const supabase = await createClient()

  const investor = await getCurrentInvestor()

  if (!investor) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <Nav />
        <h1 className="text-3xl font-bold text-red-500">
          Investor not found
        </h1>
      </main>
    )
  }

  const { data: transactions } = await supabase
    .from('investor_transactions')
    .select('*')
    .eq('investor_id', investor.id)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <Nav />
      <MarketTicker />

      <h1 className="text-4xl font-bold text-cyan-400">
        Transactions
      </h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        {transactions?.length ? (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex justify-between py-3 border-b border-zinc-800"
            >
              <div>{tx.transaction_type}</div>

              <div>
                ${Number(tx.amount).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <p className="text-zinc-400">
            No transactions found.
          </p>
        )}
      </div>
    </main>
  )
}
