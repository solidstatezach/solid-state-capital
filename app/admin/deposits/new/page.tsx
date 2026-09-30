'use client'

import { useEffect, useState } from 'react'

type Investor = {
  id: string
  name: string
  email: string
}

export default function NewDepositPage() {
  const [investors, setInvestors] = useState<Investor[]>([])
  const [investorId, setInvestorId] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    async function loadInvestors() {
      const res = await fetch('/api/admin/investors')

      if (!res.ok) return

      const data = await res.json()

      setInvestors(data)

      if (data.length > 0) {
        setInvestorId(data[0].id)
      }
    }

    loadInvestors()
  }, [])

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault()

    setStatus('Saving...')

    const res = await fetch(
      '/api/admin/deposits',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investorId: investorId,
          amount: Number(amount),
        }),
      }
    )

    if (res.ok) {
      setStatus('Deposit recorded')
      setAmount('')
    } else {
      setStatus('Failed')
    }
  }

  return (
    <main className="max-w-xl">
      <h1 className="text-3xl font-bold mb-6">
        Record Deposit
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-zinc-900 p-6 rounded-xl"
      >
        <div>
          <label className="block mb-2">
            Investor
          </label>

          <select
            value={investorId}
            onChange={(e) =>
              setInvestorId(e.target.value)
            }
            className="w-full p-3 rounded bg-zinc-800"
          >
            {investors.map((investor) => (
              <option
                key={investor.id}
                value={investor.id}
              >
                {investor.name} ({investor.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">
            Amount
          </label>

          <input
            type="number"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            className="w-full p-3 rounded bg-zinc-800"
          />
        </div>

        <button
          type="submit"
          className="bg-cyan-500 px-4 py-2 rounded font-bold"
        >
          Save Deposit
        </button>

        <div>{status}</div>
      </form>
    </main>
  )
}
