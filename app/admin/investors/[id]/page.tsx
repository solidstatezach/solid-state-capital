import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function InvestorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()

  const { data: investor } = await supabase
    .from('investors')
    .select('*')
    .eq('id', id)
    .single()

  if (!investor) notFound()

  return (
    <main className="p-8 text-white">
      <h1 className="text-4xl font-bold mb-6">
        {investor.full_name}
      </h1>

      <div className="space-y-3 bg-zinc-900 p-6 rounded-lg">
        <p>Email: {investor.email}</p>

        <p>
          Balance: $
          {Number(investor.balance).toLocaleString()}
        </p>

        <p>
          Invested: $
          {Number(investor.total_invested).toLocaleString()}
        </p>

        <p>
          Profit: $
          {Number(investor.total_profit).toLocaleString()}
        </p>

        <p>Status: {investor.status}</p>
      </div>
    </main>
  )
}
