'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PortfolioPage() {
  const supabase = createClient()

  const [portfolioValue, setPortfolioValue] = useState(0)
  const [investorCount, setInvestorCount] = useState(0)
  const [totalDeposits, setTotalDeposits] = useState(0)
  const [totalProfits, setTotalProfits] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: investors } = await supabase
      .from('investors')
      .select('*')

    const { data: transactions } = await supabase
      .from('investor_transactions')
      .select('*')

    const portfolio =
      investors?.reduce(
        (sum, investor) =>
          sum + Number(investor.balance || 0),
        0
      ) || 0

    const deposits =
      transactions
        ?.filter(
          (t) => t.transaction_type === 'deposit'
        )
        .reduce(
          (sum, t) => sum + Number(t.amount),
          0
        ) || 0

    const profits =
      transactions
        ?.filter(
          (t) => t.transaction_type === 'profit'
        )
        .reduce(
          (sum, t) => sum + Number(t.amount),
          0
        ) || 0

    setPortfolioValue(portfolio)
    setInvestorCount(investors?.length || 0)
    setTotalDeposits(deposits)
    setTotalProfits(profits)
  }

  return (
    <main className="p-8 text-white">
      <h1 className="text-4xl font-bold mb-8">
        Portfolio Dashboard
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-zinc-900 p-6 rounded-xl">
          <p className="text-zinc-400">
            Portfolio Value
          </p>

          <p className="text-3xl font-bold">
            ${portfolioValue.toFixed(2)}
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl">
          <p className="text-zinc-400">
            Investors
          </p>

          <p className="text-3xl font-bold">
            {investorCount}
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl">
          <p className="text-zinc-400">
            Total Deposits
          </p>

          <p className="text-3xl font-bold">
            ${totalDeposits.toFixed(2)}
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl">
          <p className="text-zinc-400">
            Total Profits
          </p>

          <p className="text-3xl font-bold">
            ${totalProfits.toFixed(2)}
          </p>
        </div>

      </div>
    </main>
  )
}
