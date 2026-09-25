'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TransactionsPage() {
  const supabase = createClient()

  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    loadTransactions()
  }, [])

  async function loadTransactions() {
    const { data, error } = await supabase
      .from('investor_transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setTransactions(data || [])
    }
  }

  return (
    <main className="p-8 text-white">
      <h1 className="text-4xl font-bold mb-6">
        Transaction Ledger
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border border-zinc-700">
          <thead>
            <tr className="bg-zinc-900">
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Notes</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-t border-zinc-800"
              >
                <td className="p-3">
                  {new Date(
                    tx.created_at
                  ).toLocaleString()}
                </td>

                <td className="p-3 capitalize">
                  {tx.transaction_type}
                </td>

                <td className="p-3">
                  ${Number(tx.amount).toFixed(2)}
                </td>

                <td className="p-3">
                  {tx.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
