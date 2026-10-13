'use client'

import { useState } from 'react'

type Investor = {
  id: string
  full_name: string
}

export default function TradeEntryForm({
  investors,
}: {
  investors: Investor[]
}) {
  const [investorId, setInvestorId] = useState('')
  const [asset, setAsset] = useState('')
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    const res = await fetch('/api/admin/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        investor_id: investorId,
        asset: asset.trim(),
        side,
        quantity: Number(quantity),
        price: Number(price),
        notes: notes.trim() || undefined,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setStatus(`Error: ${data.error || 'trade failed'}`)
      return
    }

    const pnl = Number(data.realized_pnl || 0)
    setStatus(
      `Trade executed${side === 'sell' ? `. Realized P/L: $${pnl.toFixed(2)}` : ''}`
    )
    setAsset('')
    setQuantity('')
    setPrice('')
    setNotes('')
    setTimeout(() => location.reload(), 1500)
  }

  const inputCls =
    'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">
        Enter Trade
      </h2>

      <form onSubmit={submit} className="grid md:grid-cols-3 gap-4">
        <label className="block">
          <span className="text-sm text-zinc-400">Investor</span>
          <select
            value={investorId}
            onChange={(e) => setInvestorId(e.target.value)}
            required
            className={inputCls}
          >
            <option value="">Select…</option>
            {investors.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.full_name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-zinc-400">Asset</span>
          <input
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            required
            placeholder="BTC"
            className={inputCls}
          />
        </label>

        <div className="block">
          <span className="text-sm text-zinc-400">Side</span>
          <div className="flex gap-2 mt-1">
            {(['buy', 'sell'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className={`flex-1 px-4 py-2 rounded-lg font-bold uppercase ${
                  side === s
                    ? s === 'buy'
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-sm text-zinc-400">Quantity</span>
          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            type="number"
            min="0"
            step="any"
            placeholder="0.5"
            className={inputCls}
          />
        </label>

        <label className="block">
          <span className="text-sm text-zinc-400">Price</span>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            type="number"
            min="0"
            step="any"
            placeholder="65000"
            className={inputCls}
          />
        </label>

        <label className="block">
          <span className="text-sm text-zinc-400">Notes</span>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
            className={inputCls}
          />
        </label>

        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Executing…' : 'Execute Trade'}
          </button>

          {status && (
            <p
              className={`mt-3 text-sm ${
                status.startsWith('Error')
                  ? 'text-red-400'
                  : 'text-green-400'
              }`}
            >
              {status}
            </p>
          )}
        </div>
      </form>

      <p className="text-xs text-zinc-500 mt-4">
        Buys debit investor cash and update the position&apos;s weighted
        average cost. Sells credit cash and book realized P/L. Every
        trade writes to the transaction ledger and the audit log
        atomically.
      </p>
    </div>
  )
}
