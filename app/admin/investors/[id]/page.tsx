'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function InvestorDetailPage() {
  const supabase = createClient()
  const params = useParams()

  const [investor, setInvestor] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    loadInvestor()
  }, [])

  async function loadInvestor() {
    const investorId = params.id as string

    const { data: investorData } = await supabase
      .from('investors')
      .select('*')
      .eq('id', investorId)
      .single()

    setInvestor(investorData)

    const { data: transactionData } = await supabase
      .from('investor_transactions')
      .select('*')
      .eq('investor_id', investorId)
      .order('created_at', { ascending: false })

    setTransactions(transactionData || [])
  }

  if (!investor) {
    return (
      <main className="p-8 text-white">
        Loading...
      </main>
    )
  }

  return (
    <main className="p-8 text-white">
      <h1 className="text-4xl font-bold mb-8">
        {investor.full_name}
      </h1>

      <div className="grid gap-4 mb-8">
        <div className="bg-zinc-900 p-4 rounded-xl">
          <p className="text-zinc-400">
            Current Balance
          </p>

          <p className="text-3xl font-bold">
            ${Number(investor.balance || 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl">
          <p className="text-zinc-400">
            Total Invested
          </p>

          <p className="text-3xl font-bold">
            ${Number(investor.total_invested || 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl">
          <p className="text-zinc-400">
            Total Profit
          </p>

          <p className="text-3xl font-bold">
            ${Number(investor.total_profit || 0).toFixed(2)}
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">
        Transaction History
      </h2>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="bg-zinc-900 p-4 rounded-xl"
          >
            <div className="flex justify-between">
              <span className="capitalize">
                {tx.transaction_type}
              </span>

              <span>
                ${Number(tx.amount).toFixed(2)}
              </span>
            </div>

            <p className="text-zinc-400 text-sm mt-2">
              {tx.notes}
            </p>

            <p className="text-zinc-500 text-xs mt-1">
              {new Date(
                tx.created_at
              ).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}
