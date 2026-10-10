'use client'

import { useState } from 'react'

type Position = {
  id: string
  asset: string
  quantity: number
  average_cost: number
  current_price: number
  investors?: { full_name: string } | null
}

const money = (n: number) =>
  `$${Number(n || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`

export default function PositionsTable({
  positions,
}: {
  positions: Position[]
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    quantity: '',
    average_cost: '',
    current_price: '',
  })
  const [busy, setBusy] = useState(false)

  function startEdit(p: Position) {
    setEditingId(p.id)
    setForm({
      quantity: String(p.quantity),
      average_cost: String(p.average_cost),
      current_price: String(p.current_price),
    })
  }

  async function saveEdit(id: string) {
    setBusy(true)
    const res = await fetch(`/api/admin/portfolios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quantity: Number(form.quantity),
        average_cost: Number(form.average_cost),
        current_price: Number(form.current_price),
      }),
    })
    setBusy(false)
    if (!res.ok) {
      const data = await res.json()
      alert(`Update failed: ${data.error}`)
      return
    }
    setEditingId(null)
    location.reload()
  }

  async function remove(id: string, asset: string) {
    if (
      !confirm(
        `Delete the ${asset} position? This is recorded in the audit log.`
      )
    ) {
      return
    }
    setBusy(true)
    const res = await fetch(`/api/admin/portfolios/${id}`, {
      method: 'DELETE',
    })
    setBusy(false)
    if (!res.ok) {
      const data = await res.json()
      alert(`Delete failed: ${data.error}`)
      return
    }
    location.reload()
  }

  const inputCls =
    'w-24 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-x-auto">
      <table className="w-full">
        <thead className="bg-zinc-800">
          <tr>
            <th className="p-4 text-left">Investor</th>
            <th className="p-4 text-left">Asset</th>
            <th className="p-4 text-left">Quantity</th>
            <th className="p-4 text-left">Avg Cost</th>
            <th className="p-4 text-left">Price</th>
            <th className="p-4 text-left">Value</th>
            <th className="p-4 text-left">Unrealized</th>
            <th className="p-4 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {positions?.map((p) => {
            const qty = Number(p.quantity) || 0
            const avg = Number(p.average_cost) || 0
            const price = Number(p.current_price) || 0
            const unrealized = qty * (price - avg)
            const editing = editingId === p.id

            return (
              <tr key={p.id} className="border-t border-zinc-800">
                <td className="p-4">
                  {p.investors?.full_name}
                </td>

                <td className="p-4 font-bold">{p.asset}</td>

                <td className="p-4">
                  {editing ? (
                    <input
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({ ...form, quantity: e.target.value })
                      }
                      type="number"
                      min="0"
                      step="any"
                      className={inputCls}
                    />
                  ) : (
                    qty
                  )}
                </td>

                <td className="p-4">
                  {editing ? (
                    <input
                      value={form.average_cost}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          average_cost: e.target.value,
                        })
                      }
                      type="number"
                      min="0"
                      step="any"
                      className={inputCls}
                    />
                  ) : (
                    money(avg)
                  )}
                </td>

                <td className="p-4">
                  {editing ? (
                    <input
                      value={form.current_price}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          current_price: e.target.value,
                        })
                      }
                      type="number"
                      min="0"
                      step="any"
                      className={inputCls}
                    />
                  ) : (
                    money(price)
                  )}
                </td>

                <td className="p-4 text-cyan-400 font-bold">
                  {money(qty * price)}
                </td>

                <td
                  className={`p-4 font-bold ${
                    unrealized >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {unrealized >= 0 ? '+' : ''}
                  {money(unrealized)}
                </td>

                <td className="p-4">
                  {editing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(p.id)}
                        disabled={busy}
                        className="px-3 py-1 rounded bg-green-600 text-white text-sm"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 rounded bg-zinc-700 text-white text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(p)}
                        className="px-3 py-1 rounded bg-zinc-700 text-white text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => remove(p.id, p.asset)}
                        disabled={busy}
                        className="px-3 py-1 rounded bg-red-700 text-white text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {(!positions || positions.length === 0) && (
        <p className="p-8 text-center text-zinc-500">
          No positions yet. Enter a trade above to open one.
        </p>
      )}
    </div>
  )
}
