'use client'

import { useEffect, useState } from 'react'

type WithdrawalRequest = {
  id: string
  amount: number
  wallet_address: string
  status: string
  created_at: string
  investors: {
    full_name: string
    email: string
  } | null
}

export default function WithdrawalsClient() {
  const [requests, setRequests] = useState<
    WithdrawalRequest[]
  >([])
  const [actionMsg, setActionMsg] = useState('')

  async function loadRequests() {
    const res = await fetch('/api/admin/withdrawal-requests')

    if (!res.ok) return

    setRequests(await res.json())
  }

  useEffect(() => {
    loadRequests()
  }, [])

  async function handleAction(
    id: string,
    action: 'approved' | 'rejected'
  ) {
    setActionMsg('Working...')

    const res = await fetch('/api/admin/withdrawal-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, action }),
    })

    if (res.ok) {
      setActionMsg(
        action === 'approved'
          ? 'Withdrawal approved and recorded'
          : 'Request rejected'
      )
      loadRequests()
    } else {
      const error = await res.json()
      setActionMsg(error.error || 'Failed')
    }
  }

  const pending = requests.filter(
    (r) => r.status === 'pending'
  )
  const decided = requests.filter(
    (r) => r.status !== 'pending'
  )

  return (
    <main className="max-w-3xl space-y-10">
      <section>
        <h1 className="text-3xl font-bold mb-6">
          Withdrawal Requests
        </h1>

        {actionMsg && (
          <p className="text-cyan-400 mb-4">
            {actionMsg}
          </p>
        )}

        {pending.length === 0 ? (
          <p className="text-zinc-400">
            No pending requests.
          </p>
        ) : (
          <div className="space-y-4">
            {pending.map((r) => (
              <div
                key={r.id}
                className="bg-zinc-900 p-5 rounded-xl flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <div className="font-bold">
                    {r.investors?.full_name ||
                      'Unknown investor'}{' '}
                    <span className="text-zinc-500 font-normal">
                      ({r.investors?.email})
                    </span>
                  </div>

                  <div className="text-2xl font-bold mt-1">
                    $
                    {Number(
                      r.amount
                    ).toLocaleString()}
                  </div>

                  <div className="text-zinc-400 text-sm mt-1 break-all">
                    Wallet: {r.wallet_address}
                  </div>

                  <div className="text-zinc-500 text-xs mt-1">
                    {new Date(
                      r.created_at
                    ).toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleAction(r.id, 'approved')
                    }
                    className="btn-primary btn-sm"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      handleAction(r.id, 'rejected')
                    }
                    className="btn-secondary btn-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {decided.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">
              Recent decisions
            </h2>

            <div className="space-y-2">
              {decided.slice(0, 10).map((r) => (
                <div
                  key={r.id}
                  className="bg-zinc-900/60 p-3 rounded-lg text-sm flex justify-between"
                >
                  <span>
                    {r.investors?.full_name} — $
                    {Number(r.amount).toLocaleString()}
                  </span>

                  <span
                    className={
                      r.status === 'approved'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
