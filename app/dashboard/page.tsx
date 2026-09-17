import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <main className="p-10">
      <h1 className="text-4xl font-bold mb-2">
        Solid State Capital
      </h1>

      <p className="text-gray-500 mb-8">
        Welcome, {profile?.full_name || user.email}
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold">Balance</h2>
          <p className="text-3xl font-bold">
            ${profile?.balance ?? 0}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-semibold">Total Invested</h2>
          <p className="text-3xl font-bold">
            ${profile?.total_invested ?? 0}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-semibold">Total Profit</h2>
          <p className="text-3xl font-bold">
            ${profile?.total_profit ?? 0}
          </p>
        </div>
      </div>
    </main>
  )
}
