'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NewTransactionPage() {
  const supabase = createClient()

  const [investors, setInvestors] = useState<any[]>([])
  const [investorId, setInvestorId] = useState('')
  const [transactionType, setTransactionType] = useState('deposit')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadInvestors() {
      const { data } = await supabase
        .from('investors')
        .select('id, full_name')
        .order('full_name')

      setInvestors(data || [])
    }

    loadInvestors()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const amountUsd = Number(amount)

    const { error } = await supabase
      .from('transactions')
      .insert([
        {
          transaction_type: transactionType,
          amount_usd: amountUsd,
          asset_symbol: 'USD',
          quantity: 1,
          price: amountUsd,
        },
      ])

    if (error) {
      setMessage(error.message)
      return
    }

    const { data: investor } = await supabase
      .from('investors')
      .select('*')
      .eq('id', investorId)
      .single()

    if (investor) {
      let balance = Number(investor.balance || 0)

      if (
        transactionType === 'deposit' ||
        transactionType === 'profit'
      ) {
        balance += amountUsd
      }

      if (
        transactionType === 'withdrawal' ||
        transactionType === 'loss'
      ) {
        balance -= amountUsd
      }

      await supabase
        .from('investors')
        .update({ balance })
        .eq('id', investorId)
    }

    setAmount('')
    setMessage('Transaction recorded')
  }

  return (
    <main className="p-8 text-white">
      <h1 className="text-4xl font-bold mb-6">
        New Transaction
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-w-xl"
      >
        <select
          value={investorId}
          onChange={(e) => setInvestorId(e.target.value)}
          className="w-full p-3 rounded bg-zinc-900 border border-zinc-700"
        >
          <option value="">
            Select Investor
          </option>

          {investors.map((investor) => (
            <option
              key={investor.id}
              value={investor.id}
            >
              {investor.full_name}
            </option>
          ))}
        </select>

        <select
          value={transactionType}
          onChange={(e) =>
            setTransactionType(e.target.value)
          }
          className="w-full p-3 rounded bg-zinc-900 border border-zinc-700"
        >
          <option value="deposit">
            Deposit
          </option>
          <option value="withdrawal">
            Withdrawal
          </option>
          <option value="profit">
            Profit
          </option>
          <option value="loss">
            Loss
          </option>
        </select>

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 rounded bg-zinc-900 border border-zinc-700"
        />

        <button
          type="submit"
          className="bg-green-600 px-6 py-3 rounded-lg font-bold"
        >
          Save Transaction
        </button>

        {message && (
          <p className="text-cyan-400">
            {message}
          </p>
        )}
      </form>
    </main>
  )
}
