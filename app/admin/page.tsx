import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()

  const [{ count: investorCount }, { data: investors }, { data: transactions }] =
    await Promise.all([
      supabase
        .from('investors')
        .select('*', { count: 'exact', head: true }),

      supabase
        .from('investors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5),

      supabase
        .from('investor_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10),
    ])

  const totalAUM =
    investors?.reduce(
      (sum, investor) => sum + Number(investor.balance || 0),
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="text-zinc-400">
            Investors
          </div>

          <div className="text-3xl font-bold mt-2">
            {investorCount || 0}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="text-zinc-400">
            Assets Under Management
          </div>

          <div className="text-3xl font-bold mt-2">
            ${totalAUM.toLocaleString()}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="text-zinc-400">
            Deposits
          </div>

          <div className="text-3xl font-bold mt-2">
            0
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="text-zinc-400">
            Withdrawals
          </div>

          <div className="text-3xl font-bold mt-2">
            0
          </div>
        </div>
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
          href="/admin/transactions/new"
          className="bg-purple-600 rounded-2xl p-6 font-bold text-center"
        >
          + Transaction
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            Latest Investors
          </h2>

          <div className="space-y-3">
            {investors?.map((investor) => (
              <Link
                key={investor.id}
                href={`/admin/investors/${investor.id}`}
                className="block border-b border-zinc-800 pb-3"
              >
                <div className="font-medium">
                  {investor.full_name}
                </div>

                <div className="text-sm text-zinc-500">
                  ${Number(investor.balance).toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
