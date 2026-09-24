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
    .order('created_at', { ascending: false })

  if (!investor) {
    return (
      <main className="p-8 text-white">
        Investor not found
      </main>
    )
  }

  return (
    <main className="p-8 text-white">
      <h1 className="text-4xl font-bold mb-6">
        {investor.full_name}
      </h1>

      <div className="bg-zinc-900 rounded-lg p-6 mb-8">
        <p>Email: {investor.email}</p>
        <p>Balance: ${Number(investor.balance).toLocaleString()}</p>
        <p>
          Invested: $
          {Number(investor.total_invested).toLocaleString()}
        </p>
        <p>
          Profit: $
          {Number(investor.total_profit).toLocaleString()}
        </p>
        <p>Status: {investor.status}</p>
      </div>

      <h2 className="text-2xl font-bold mb-4">
        Transaction History
      </h2>

      <div className="space-y-3">
        {transactions?.length ? (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 rounded-lg bg-zinc-900 border border-zinc-800"
            >
              <p>{tx.transaction_type}</p>
              <p>${Number(tx.amount).toLocaleString()}</p>
              <p>{tx.notes}</p>
            </div>
          ))
        ) : (
          <p className="text-zinc-400">
            No transactions yet
          </p>
        )}
      </div>
    </main>
  )
}	

