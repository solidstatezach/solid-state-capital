import { createClient } from '@/lib/supabase/server'
import StatCard from '@/components/admin/StatCard'
import AUMChart from '@/components/admin/AUMChart'
import AllocationChart from '@/components/admin/AllocationChart'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: investors } = await supabase
    .from('investors')
    .select('*')
    .limit(1)

  const investor = investors?.[0]

  const { data: transactions } = await supabase
    .from('investor_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <main className="p-8 text-white space-y-8">

      <div>
        <h1 className="text-4xl font-bold text-cyan-400">
          Investor Dashboard
        </h1>

        <p className="text-zinc-400 mt-2">
          Portfolio Overview
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">

        <StatCard
          title="Current Balance"
          value={`$${Number(
            investor?.balance || 0
          ).toLocaleString()}`}
        />

        <StatCard
          title="Total Invested"
          value={`$${Number(
            investor?.total_invested || 0
          ).toLocaleString()}`}
        />

        <StatCard
          title="Total Profit"
          value={`$${Number(
            investor?.total_profit || 0
          ).toLocaleString()}`}
          valueClassName="text-green-400"
        />

        <StatCard
          title="Account Status"
          value="Active"
        />

      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            Portfolio Growth
          </h2>

          <AUMChart />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            Allocation
          </h2>

          <AllocationChart
            data={[
              {
                name: 'BTC',
                value: Number(
                  investor?.balance || 0
                ),
              },
            ]}
          />
        </div>

      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Recent Transactions
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
