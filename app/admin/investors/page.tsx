import { createClient } from '@/lib/supabase/server'

export default async function InvestorsPage() {
  const supabase = await createClient()

  const { data: investors } = await supabase
    .from('investors')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">
        Investors
      </h1>

      <div className="space-y-4">
        {investors?.map((investor) => (
          <div
            key={investor.id}
            className="border border-zinc-800 rounded-xl p-4"
          >
            <h2>{investor.full_name}</h2>
            <p>{investor.email}</p>
            <p>${investor.balance}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
