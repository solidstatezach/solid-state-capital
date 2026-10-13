'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LogOut, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LogoutPage() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.signOut().finally(() => setDone(true))
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-black text-white">
      <div className="glass-card p-8 w-full max-w-sm text-center space-y-6">
        {done ? (
          <>
            <CheckCircle2 size={40} className="mx-auto text-green-400" />
            <div>
              <h1 className="text-2xl font-black">Signed out</h1>
              <p className="text-zinc-400 mt-2 text-sm">
                Your session has ended securely.
              </p>
            </div>
            <Link href="/login" className="btn-primary w-full">
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <LogOut size={40} className="mx-auto text-cyan-400 animate-pulse" />
            <p className="text-zinc-400">Signing you out…</p>
          </>
        )}
      </div>
    </main>
  )
}
