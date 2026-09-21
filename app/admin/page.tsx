import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
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

  const { data: investors } = await supabase
    .from('investors')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-slate-950 text-white p-6">

      <div className="mb-10">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Solid State Capital
        </h1>

        <p className="text-zinc-400 mt-2">
          Founder Administration Dashboard
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-4 mb-8">

        <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
          <div className="text-zinc-400 text-sm">Portfolio</div>
          <div className="text-3xl font-bold">
            ${profile?.balance ?? 0}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
          <div className="text-zinc-400 text-sm">Invested</div>
          <div className="text-3xl font-bold text-cyan-400">
            ${profile?.total_invested ?? 0}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
          <div className="text-zinc-400 text-sm">Profit</div>
          <div className="text-3xl font-bold text-emerald-400">
            ${profile?.total_profit ?? 0}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
          <div className="text-zinc-400 text-sm">Status</div>
          <div className="text-2xl font-bold">
            {profile?.status}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
          <div className="text-zinc-400 text-sm">Role</div>
          <div className="text-2xl font-bold text-purple-400">
            Founder
          </div>
        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">
            Founder Profile
          </h2>

          <div className="space-y-2 text-zinc-300">
            <p><strong>Name:</strong> {profile?.full_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Investor Type:</strong> {profile?.investor_type}</p>
            <p><strong>Admin:</strong> {profile?.is_admin ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">
            System Status
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Supabase</span>
              <span className="text-emerald-400">ONLINE</span>
            </div>

            <div className="flex justify-between">
              <span>Authentication</span>
              <span className="text-emerald-400">ACTIVE</span>
            </div>

            <div className="flex justify-between">
              <span>Database</span>
              <span className="text-emerald-400">CONNECTED</span>
            </div>

            <div className="flex justify-between">
              <span>Founder Access</span>
              <span className="text-purple-400">GRANTED</span>
            </div>
          </div>
        </div>

      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">
          Investor Database
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Balance</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {investors?.map((investor: any) => (
                <tr
                  key={investor.id}
                  className="border-b border-zinc-800 hover:bg-zinc-800"
                >
                  <td className="p-3">
                    {investor.full_name}
                  </td>

                  <td className="p-3">
                    {investor.email}
                  </td>

                  <td className="p-3 text-emerald-400">
                    ${investor.balance ?? 0}
                  </td>

                  <td className="p-3">
                    {investor.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">

        <Link href="/admin/investors/new">
          <button className="bg-purple-600 hover:bg-purple-700 p-4 rounded-lg font-bold w-full">
            Add Investor
          </button>
        </Link>

        <Link href="/admin/investors">
          <button className="bg-cyan-600 hover:bg-cyan-700 p-4 rounded-lg font-bold w-full">
            Manage Accounts
          </button>
        </Link>

        <Link href="/admin/trading">
          <button className="bg-emerald-600 hover:bg-emerald-700 p-4 rounded-lg font-bold w-full">
            Trading Panel
          </button>
        </Link>

        <Link href="/admin/system">
          <button className="bg-red-600 hover:bg-red-700 p-4 rounded-lg font-bold w-full">
            System Admin
          </button>
        </Link>

      </div>

    </main>
  )
}
