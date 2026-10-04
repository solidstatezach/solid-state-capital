import { requireAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export default async function TransactionsPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: transactions } = await supabase
    .from('investor_transactions')
    .select(`
      *,
      investors (
        full_name
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-cyan-400">
          Transactions
        </h1>

        <p className="text-zinc-400 mt-2">
          Investor activity ledger
        </p>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-800">
            <tr>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Investor</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Notes</th>
            </tr>
          </thead>

          <tbody>
            {transactions?.map((tx: any) => (
              <tr
                key={tx.id}
                className="border-t border-zinc-800"
              >
                <td className="p-4">
                  {new Date(
                    tx.created_at
                  ).toLocaleDateString()}
                </td>

                <td className="p-4">
                  {tx.investors?.full_name}
                </td>

                <td className="p-4 capitalize">
                  {tx.transaction_type}
                </td>

                <td className="p-4 font-bold">
                  ${Number(tx.amount).toLocaleString()}
                </td>

                <td className="p-4">
                  {tx.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
