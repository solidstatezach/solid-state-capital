import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

import AUMChart from '@/components/admin/AUMChart'
import AllocationChart from '@/components/admin/AllocationChart'
import StatCard from '@/components/admin/StatCard'

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: investorCount },
    { data: investors },
    { data: transactions },
  ] = await Promise.all([
    supabase
      .from('investors')
      .select('*', {
        count: 'exact',
        head: true,
      }),

    supabase
      .from('investors')
      .select('*'),

    supabase
      .from('investor_transactions')
      .select('*')
      .order('created_at', {
        ascending: false,
      })
      .limit(10),
  ])

  const totalAUM =
    investors?.reduce(
      (sum, investor) =>
        sum + Number(investor.balance || 0),
      0
    ) || 0

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-cyan-400">
          Solid State Capital
        </h1>

        <p className="text-zinc-400 mt-2">
          Admin Dashboard
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <StatCard
          title="Investors"
          value={String(investorCount || 0)}
        />

        <StatCard
          title="Assets Under Management"
          value={`$${totalAUM.toLocaleString()}`}
        />

        <StatCard
          title="Transactions"
          value={String(transactions?.length || 0)}
        />

        <StatCard
          title="Status"
          value="Online"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Link
          href="/admin/investors/new"
          className="bg-cyan-500 text-black rounded-2xl p-6 font-bold text-center"
        >
          + Investor
        </Link>

        <Link
          href="/admin/deposits/new"
          className="bg-green-600 rounded-2xl p-6 font-bold text-center"
        >
          + Deposit
        </Link>

        <Link
          href="/admin/withdrawals/new"
          className="bg-orange-600 rounded-2xl p-6 font-bold text-center"
        >
          + Withdrawal
        </Link>

        <Link
          href="/admin/trading"
          className="bg-purple-600 rounded-2xl p-6 font-bold text-center"
        >
          Trading Panel
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            AUM Growth
          </h2>

          <AUMChart />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            Portfolio Allocation
          </h2>

          <AllocationChart />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Recent Activity
        </h2>

        <div className="space-y-3">
          {transactions?.map((tx) => (
            <div
              key={tx.id}
              className="flex justify-between border-b border-zinc-800 pb-3"
            >
              <div>
                <div className="capitalize font-medium">
                  {tx.transaction_type}
                </div>

                <div className="text-sm text-zinc-500">
                  {tx.notes || 'No notes'}
                </div>
              </div>

              <div className="font-bold">
                ${Number(tx.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
