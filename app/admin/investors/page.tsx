cat > app/admin/investors/page.tsx <<'EOF'
import Link from 'next/link'
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
              {Number(investor.total_invested || 0).toLocaleString()}
            </p>

            <p>
              Profit: $
              {Number(investor.total_profit || 0).toLocaleString()}
            </p>

            <p>Status: {investor.status}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
EOF
