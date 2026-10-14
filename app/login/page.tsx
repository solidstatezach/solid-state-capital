'use client'
import Link from "next/link"

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Friendly message on screen, raw detail in the console.
      console.error('Login failed:', error.message)
      setError(
        error.message === 'Invalid login credentials'
          ? 'Invalid email or password.'
          : "Couldn't sign in — please try again."
      )
      setLoading(false)
      return
    }

    router.push('/investor')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-950 border border-cyan-500/30 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold text-cyan-400 mb-3">
          Solid State Capital
        </h1>

        <p className="text-zinc-400 mb-8">
          Client Login
        </p>

        <form onSubmit={handleLogin}>
          <input
            className="w-full bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-white mb-4 focus:border-cyan-400 focus:outline-none"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-white mb-4 focus:border-cyan-400 focus:outline-none"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-red-500 text-sm mb-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full btn-lg"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
<Link
            href="/signup"
            className="btn-secondary w-full mt-4"
          >
            Create Account
          </Link>
        </form>
      </div>
    </main>
  )
}
