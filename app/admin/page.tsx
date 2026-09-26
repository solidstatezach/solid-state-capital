'use client'

import AUMChart from '@/components/admin/AUMChart'

export default function AdminPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Dashboard
        </h1>

        <p className="text-zinc-400 mt-1">
          Solid State Capital Overview
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <p className="text-zinc-400">Assets Under Management</p>
          <p className="text-3xl font-bold text-cyan-400">
            $1,250,000
          </p>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <p className="text-zinc-400">Investors</p>
          <p className="text-3xl font-bold text-green-400">
            42
          </p>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <p className="text-zinc-400">Monthly Return</p>
          <p className="text-3xl font-bold text-purple-400">
            +8.4%
          </p>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <p className="text-zinc-400">Open Positions</p>
          <p className="text-3xl font-bold text-yellow-400">
            12
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        <h2 className="text-xl font-bold mb-4">
          Assets Under Management
        </h2>

        <AUMChart />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <h2 className="text-xl font-bold mb-4">
            Recent Activity
          </h2>

          <div className="space-y-3">
            <div className="bg-zinc-800 p-4 rounded-lg">
              New Investor Added
            </div>

            <div className="bg-zinc-800 p-4 rounded-lg">
              Deposit +$10,000
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

          <div className="space-y-3">
            <div className="bg-zinc-800 p-4 rounded-lg">
              BTC: 45%
            </div>

            <div className="bg-zinc-800 p-4 rounded-lg">
              ETH: 30%
            </div>

            <div className="bg-zinc-800 p-4 rounded-lg">
              SOL: 15%
            </div>

            <div className="bg-zinc-800 p-4 rounded-lg">
              Cash: 10%
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
