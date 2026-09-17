'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <button
        onClick={handleLogout}
        className="bg-black text-white px-6 py-3 rounded"
      >
        Logout
      </button>
    </main>
  )
}
