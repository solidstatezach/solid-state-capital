'use client'

import Link from 'next/link'

const stats = [
  {
    title: 'Assets Under Management',
    value: '$1,250,000',
  },
  {
    title: 'Active Investors',
    value: '47',
  },
  {
    title: 'Monthly Profit',
    value: '$83,240',
  },
  {
    title: 'Transactions',
    value: '392',
  },
]

const actions = [
  {
    title: 'Add Investor',
    href: '/admin/investors/new',
  },
  {
    title: 'Add Transaction',
    href: '/admin/transactions/new',
  },
  {
    title: 'View Investors',
    href: '/admin/investors',
  },
  {
    title: 'Trading Desk',
    href: '/admin/trading',
  },
]

export default function AdminDashboard() {
  return (
    <main className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold text-cyan-400">
          Solid State Capital
        </h1>

        <p className="text-zinc-400 mt-2">
          Private Investor Management Platform
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <p className="text-zinc-400 text-sm">
              {item.title}
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">
          Quick Actions
        </h2>

        <div className="grid md:grid-cols-4 gap-4">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-xl bg-cyan-600 hover:bg-cyan-500 p-5 font-bold text-center transition"
            >
              {action.title}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <h2 className="text-xl font-bold mb-4">
            Recent Activity
          </h2>

          <div className="space-y-3">
            <div className="bg-zinc-800 p-4 rounded-lg">
              Deposit +$10,000
            </div>

            <div className="bg-zinc-800 p-4 rounded-lg">
              New Investor Added
            </div>

            <div className="bg-zinc-800 p-4 rounded-lg">
              Withdrawal -$2,500
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <h2 className="text-xl font-bold mb-4">
            Portfolio Snapshot
          </h2>

          <div className="h-64 flex items-center justify-center text-zinc-500">
            Chart Coming Soon
          </div>
        </div>

      </div>
    </main>
  )
}
