'use client'

import { useEffect, useState } from 'react'

type Investor = {
  id: string
  name: string
  email: string
}

export default function NewPositionPage() {
  const [investors, setInvestors] = useState<Investor[]>([])
  const [investorId, setInvestorId] = useState('')
  const [asset, setAsset] = useState('BTC')
  const [quantity, setQuantity] = useState('')
  const [averageCost, setAverageCost] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/investors')
      const data = await res.json()

      setInvestors(data)

      if (data.length > 0) {
        setInvestorId(data[0].id)
      }
    }

    load()
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()

    const res = await fetch(
      '/api/admin/portfolios',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investor_id: investorId,
          asset,
          quantity: Number(quantity),
          average_cost: Number(averageCost),
        }),
      }
    )

    if (res.ok) {
      setStatus('Position Added')
      setQuantity('')
      setAverageCost('')
    } else {
      setStatus('Failed')
    }
  }

  return (
    <main className="max-w-xl">
      <h1 className="text-3xl font-bold mb-6">
        Add Position
      </h1>

      <form
        onSubmit={submit}
        className="space-y-4 bg-zinc-900 p-6 rounded-xl"
      >
        <select
          value={investorId}
          onChange={(e) =>
            setInvestorId(e.target.value)
          }
          className="w-full p-3 rounded bg-zinc-800"
        >
          {investors.map((i) => (
            <option
              key={i.id}
              value={i.id}
            >
              {i.name}
            </option>
          ))}
        </select>

        <input
          value={asset}
          onChange={(e) =>
            setAsset(e.target.value)
          }
          placeholder="BTC"
          className="w-full p-3 rounded bg-zinc-800"
        />

        <input
          type="number"
          value={quantity}
          onChange={(e) =>
            setQuantity(e.target.value)
          }
          placeholder="Quantity"
          className="w-full p-3 rounded bg-zinc-800"
        />

        <input
          type="number"
          value={averageCost}
          onChange={(e) =>
            setAverageCost(e.target.value)
          }
          placeholder="Average Cost"
          className="w-full p-3 rounded bg-zinc-800"
        />

        <button
          className="bg-cyan-500 text-black px-4 py-2 rounded font-bold"
        >
          Add Position
        </button>

        <div>{status}</div>
      </form>
    </main>
  )
}
