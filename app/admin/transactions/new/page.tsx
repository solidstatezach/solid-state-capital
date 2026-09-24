'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NewTransactionPage() {
  const supabase = createClient()

  const [investors, setInvestors] = useState<any[]>([])
  const [investorId, setInvestorId] = useState('')
  const [type, setType] = useState('deposit')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
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

    const transactionAmount = Number(amount)

    const { error } = await supabase
      .from('investor_transactions')
      .insert([
        {
          investor_id: investorId,
          transaction_type: type,
          amount: transactionAmount,
          notes,
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
      let newBalance = Number(investor.balance || 0)

      if (type === 'deposit' || type === 'profit') {
        newBalance += transactionAmount
      }

      if (type === 'withdrawal' || type === 'loss') {
        newBalance -= transactionAmount
      }

      await supabase
        .from('investors')
        .update({
          balance: newBalance,
        })
        .eq('id', investorId)
    }

    setMessage('Transaction saved successfully')
    setAmount('')
    setNotes('')
  }

  return (
    <main className="p-8 text-white">
      <h1 className="text-4xl font-bold mb-6">
        New Transaction
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-4"
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
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full p-3 rounded bg-zinc-900 border border-zinc-700"
        >
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="profit">Profit</option>
          <option value="loss">Loss</option>
        </select>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="w-full p-3 rounded bg-zinc-900 border border-zinc-700"
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          className="w-full p-3 rounded bg-zinc-900 border border-zinc-700"
        />

        <button
          type="submit"
          className="bg-green-600 px-6 py-3 rounded-lg font-bold"
        >
          Save Transaction
        </button>

        {message && (
          <p className="text-green-400">
            {message}
          </p>
        )}
      </form>
    </main>
  )
}
