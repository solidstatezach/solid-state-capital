'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  /** visual style: sidebar row, nav tab, or plain button */
  variant?: 'sidebar' | 'tab' | 'button'
  className?: string
}

export default function SignOutButton({ variant = 'button', className = '' }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleSignOut() {
    if (busy) return
    setBusy(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const styles =
    variant === 'sidebar'
      ? 'flex items-center gap-3 rounded-2xl px-4 py-3 text-zinc-400 bg-transparent hover:bg-red-950/40 hover:text-red-300 border border-transparent hover:border-red-500/30 transition-all duration-200 w-full text-left'
      : variant === 'tab'
        ? 'px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap bg-zinc-800 text-zinc-300 hover:bg-red-950/60 hover:text-red-300 transition-all'
        : 'btn-ghost'

  return (
    <button
      onClick={handleSignOut}
      disabled={busy}
      className={`${styles} ${className}`}
      aria-label="Sign out"
    >
      <LogOut size={16} />
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
