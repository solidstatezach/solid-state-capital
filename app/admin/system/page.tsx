import { requireAdmin } from '@/lib/supabase/admin'

export default async function SystemPage() {
  await requireAdmin()

  return (
    <main className="p-8 text-white">
      <h1 className="text-4xl font-bold">System Administration</h1>
      <p className="text-zinc-400 mt-4">
        System tools coming soon.
      </p>
    </main>
  )
}
