'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NewInvestorPage() {
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [balance, setBalance] = useState('0')
  const [status, setStatus] = useState('active')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log('USER:', user)

    const { error } = await supabase
      .from('investors')
      .insert([
        {
          full_name: fullName,
          email,
          balance: Number(balance),
          status,
          user_id: user?.id ?? null,
        },
      ])

    if (error) {
      console.error(error)
      setMessage(error.message)
      return
    }

    setMessage('Investor added')
    setFullName('')
    setEmail('')
    setBalance('0')
    setStatus('active')
  }

  return (
    <main className="p-8 text-white">
      <h1 className="text-4xl font-bold mb-6">
        Add Investor
      </h1>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <input
          className="w-full p-3 rounded bg-zinc-900 border border-zinc-700"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          className="w-full p-3 rounded bg-zinc-900 border border-zinc-700"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 rounded bg-zinc-900 border border-zinc-700"
          placeholder="Balance"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
        />

        <select
          className="w-full p-3 rounded bg-zinc-900 border border-zinc-700"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          type="submit"
          className="bg-purple-600 px-6 py-3 rounded-lg font-bold"
        >
          Create Investor
        </button>

        {message && (
          <p className="text-cyan-400">{message}</p>
        )}
      </form>
    </main>
  )
}
