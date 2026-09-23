import { createClient } from '@/lib/supabase/server'

export default async function InvestorsPage() {
  const supabase = await createClient()

  const { data: investors } = await supabase
    .from('investors')
    .select('*')
    .order('created_at', { ascending: false })

  const totalBalance =
    investors?.reduce(
      (sum, investor) => sum + Number(investor.balance || 0),
      0
    ) || 0

  return (
    <main className="p-8 text-white">
      <h1 className="text-4xl font-bold mb-6">
        Investors
      </h1>

      <div className="mb-8 p-4 rounded-lg bg-zinc-900">
        <p>Total Investors: {investors?.length || 0}</p>
        <p>Total Balance: ${totalBalance.toLocaleString()}</p>
      </div>

      <div className="space-y-4">
        {investors?.map((investor) => (
          <div
            key={investor.id}
            className="p-4 rounded-lg bg-zinc-900 border border-zinc-800"
          >
            <h2 className="font-bold text-lg">
              {investor.full_name}
            </h2>

            <p>{investor.email}</p>

            <p>
              Balance: $
              {Number(investor.balance).toLocaleString()}
            </p>

            <p>Status: {investor.status}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
