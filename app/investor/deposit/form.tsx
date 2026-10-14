'use client'

import { useState } from 'react'

export default function DepositForm() {
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleDeposit() {
    setStatus('Preparing secure checkout...')
    setBusy(true)

    try {
      const res = await fetch('/api/investor/deposits/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: Number(amount) }),
      })

      const data = await res.json()

      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        // Never show raw API errors to the user — one human line here,
        // full detail in the console for debugging.
        console.error('Deposit checkout failed:', data.error)
        setStatus("Couldn't start checkout — please try again.")
        setBusy(false)
      }
    } catch {
      setStatus('Could not start the deposit')
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4 bg-zinc-900 p-6 rounded-xl">
      <div>
        <label className="block mb-2">
          Amount (USD)
        </label>

        <input
          type="number"
          min="1"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="100"
          className="w-full p-3 rounded bg-zinc-800"
        />
      </div>

      <button
        type="button"
        onClick={handleDeposit}
        disabled={busy}
        className="btn-primary"
      >
        {busy ? 'Preparing...' : 'Deposit with card'}
      </button>

      <p className="text-sm text-zinc-400">
        You&apos;ll pay securely through Stripe. Your balance updates
        automatically once the payment completes.
      </p>

      <div>{status}</div>
    </div>
  )
}
