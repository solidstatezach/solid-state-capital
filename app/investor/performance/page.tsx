import MarketTicker from '@/components/investor/MarketTicker'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/investor/Nav'

export default async function TransactionsPage() {
  const supabase = await createClient()

  const { data: transactions } =
    await supabase
      .from('investor_transactions')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <Nav />
      <MarketTicker />
      <h1 className="text-4xl font-bold text-cyan-400">
        Transactions
      </h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        {transactions?.map((tx) => (
          <div
            key={tx.id}
            className="flex justify-between py-3 border-b border-zinc-800"
          >
            <div>
              {tx.transaction_type}
            </div>

            <div>
              $
              {Number(tx.amount).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
