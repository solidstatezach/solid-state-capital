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
  const [stripeUrl, setStripeUrl] = useState('')
  const [stripeStatus, setStripeStatus] = useState('')
  const [copied, setCopied] = useState(false)

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

  async function handleStripeLink() {
    setStripeStatus('Creating payment link...')
    setStripeUrl('')
    setCopied(false)

    const res = await fetch(
      '/api/admin/deposits/stripe',
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

    const data = await res.json()

    if (res.ok && data.url) {
      setStripeUrl(data.url)
      setStripeStatus('Send this link to the investor — their balance credits automatically after they pay.')
    } else {
      // Never show raw API errors to the user — one human line here,
      // full detail in the console for debugging.
      console.error('Stripe link creation failed:', data.error)
      setStripeStatus('Could not create the payment link — please try again.')
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(stripeUrl)
      setCopied(true)
    } catch {
      setCopied(false)
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
          className="btn-primary"
        >
          Save Deposit
        </button>

        <div>{status}</div>
      </form>

      <section className="mt-6 space-y-4 bg-zinc-900 p-6 rounded-xl">
        <h2 className="text-xl font-bold">
          Collect by card via Stripe
        </h2>

        <p className="text-sm text-zinc-400">
          Creates a Stripe payment link for the investor and amount above.
          Their balance credits automatically once they pay.
        </p>

        <button
          type="button"
          onClick={handleStripeLink}
          className="btn-secondary"
        >
          Create Stripe payment link
        </button>

        {stripeUrl && (
          <div className="flex gap-2">
            <input
              readOnly
              value={stripeUrl}
              className="w-full p-3 rounded bg-zinc-800 text-sm"
            />

            <button
              type="button"
              onClick={handleCopy}
              className="btn-ghost whitespace-nowrap"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}

        <div>{stripeStatus}</div>
      </section>
    </main>
  )
}
