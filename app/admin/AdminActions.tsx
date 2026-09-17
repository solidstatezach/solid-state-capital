'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminActions({
  userId,
}: {
  userId: string
}) {
  const [loading, setLoading] = useState(false)

  async function updateBalance(amount: number) {
    setLoading(true)

    const supabase = createClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single()

    if (!profile) {
      setLoading(false)
      return
    }

    const newBalance =
      Number(profile.balance || 0) + amount

    await supabase
      .from('profiles')
      .update({
        balance: newBalance,
      })
      .eq('id', userId)

    location.reload()
  }

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <button
        onClick={() => updateBalance(100)}
        disabled={loading}
        className="px-4 py-2 rounded bg-green-600 text-white"
      >
        +$100
      </button>

      <button
        onClick={() => updateBalance(1000)}
        disabled={loading}
        className="px-4 py-2 rounded bg-green-700 text-white"
      >
        +$1000
      </button>

      <button
        onClick={() => updateBalance(-100)}
        disabled={loading}
        className="px-4 py-2 rounded bg-red-600 text-white"
      >
        -$100
      </button>

      <button
        onClick={() => updateBalance(-1000)}
        disabled={loading}
        className="px-4 py-2 rounded bg-red-700 text-white"
      >
        -$1000
      </button>
    </div>
  )
}
