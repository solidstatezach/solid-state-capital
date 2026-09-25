'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AdminPage() {
  const supabase = createClient()

  const [stats, setStats] = useState({
    investors: 0,
    capital: 0,
    profit: 0,
    transactions: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const { data: investors } = await supabase
      .from('investors')
      .select('*')

    const { count } = await supabase
      .from('investor_transactions')
      .select('*', { count: 'exact', head: true })

    const totalCapital =
      investors?.reduce(
        (sum, investor) =>
          sum + Number(investor.balance || 0),
        0
      ) || 0

    const totalProfit =
      investors?.reduce(
        (sum, investor) =>
          sum + Number(investor.total_profit || 0),
        0
      ) || 0

    setStats({
      investors: investors?.length || 0,
      capital: totalCapital,
      profit: totalProfit,
      transactions: count || 0,
    })
  }

  return (
    <main className="p-8 text-white">
      <h1 className="text-4xl font-bold mb-8">
        Admin Dashboard
      </h1>

      <div className="grid gap-4 mb-8">
        <div className="bg-zinc-900 p-6 rounded-xl">
          <p className="text-zinc-400">Total Investors</p>
          <p className="text-3xl font-bold">
            {stats.investors}
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl">
          <p className="text-zinc-400">Total Capital</p>
          <p className="text-3xl font-bold">
            ${stats.capital.toFixed(2)}
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl">
          <p className="text-zinc-400">Total Profit</p>
          <p className="text-3xl font-bold text-cyan-400">
            ${stats.profit.toFixed(2)}
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl">
          <p className="text-zinc-400">
            Total Transactions
          </p>
          <p className="text-3xl font-bold">
            {stats.transactions}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Link
          href="/admin/investors"
          className="block bg-zinc-900 p-4 rounded-xl"
        >
          Investors
        </Link>

        <Link
          href="/admin/transactions"
          className="block bg-zinc-900 p-4 rounded-xl"
        >
          Transaction Ledger
        </Link>

        <Link
          href="/admin/transactions/new"
          className="block bg-green-700 p-4 rounded-xl font-bold"
        >
          New Transaction
        </Link>
      </div>
    </main>
  )
}
