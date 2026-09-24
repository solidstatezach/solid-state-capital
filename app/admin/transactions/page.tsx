import { createClient } from '@/lib/supabase/server'

export default async function TransactionsPage() {
  const supabase = await createClient()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="p-8 text-white">
      <h1 className="text-4xl font-bold mb-6">
        Transaction Ledger
      </h1>

      <div className="space-y-4">
        {transactions?.map((tx) => (
          <div
            key={tx.id}
            className="p-4 rounded-lg bg-zinc-900 border border-zinc-800"
          >
            <p>
              <strong>Type:</strong> {tx.type}
            </p>

            <p>
              <strong>Amount:</strong> $
              {Number(tx.amount).toLocaleString()}
            </p>

            <p>
              <strong>Investor ID:</strong> {tx.investor_id}
            </p>

            <p>
              <strong>Notes:</strong> {tx.notes}
            </p>

            <p>
              <strong>Date:</strong> {tx.created_at}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}
