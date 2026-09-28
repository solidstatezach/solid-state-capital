'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

type Investor = {
  id: string
  full_name: string
  email: string
  balance: number
  total_invested: number
  total_profit: number
  status: string
}

export default function InvestorList({
  investors,
}: {
  investors: Investor[]
}) {
  const [search, setSearch] = useState('')

  const filteredInvestors = useMemo(() => {
    const query = search.toLowerCase()

    return investors.filter(
      (investor) =>
        investor.full_name?.toLowerCase().includes(query) ||
        investor.email?.toLowerCase().includes(query)
    )
  }, [investors, search])

  return (
    <>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <div className="space-y-4">
        {filteredInvestors.map((investor) => (
          <div
            key={investor.id}
            className="p-4 rounded-lg bg-zinc-900 border border-zinc-800"
          >
            <Link
              href={`/admin/investors/${investor.id}`}
              className="font-bold text-lg text-cyan-400"
            >
              {investor.full_name}
            </Link>

            <p>{investor.email}</p>

            <p>
              Balance: $
              {Number(investor.balance).toLocaleString()}
            </p>

            <p>
              Invested: $
              {Number(
                investor.total_invested || 0
              ).toLocaleString()}
            </p>

            <p>
              Profit: $
              {Number(
                investor.total_profit || 0
              ).toLocaleString()}
            </p>

            <p>Status: {investor.status}</p>
          </div>
        ))}
      </div>
    </>
  )
}
