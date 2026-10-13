import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentInvestor } from '@/lib/supabase/currentInvestor'
import { formatMoney } from '@/lib/portfolio'
import DepositForm from './form'

export default async function DepositPage({
  searchParams,
}: {
  searchParams: Promise<{ deposit?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const investor = await getCurrentInvestor()

  if (!investor) {
    redirect('/login')
  }

  const params = await searchParams

  return (
    <main className="max-w-xl space-y-6">
      <h1 className="text-4xl font-bold text-cyan-400">
        Deposit Funds
      </h1>

      <p className="text-zinc-400">
        Current balance:{' '}
        <span className="text-white font-bold">
          {formatMoney(Number(investor.balance ?? 0))}
        </span>
      </p>

      {params.deposit === 'success' && (
        <p className="p-4 rounded-xl bg-emerald-900/50 text-emerald-300">
          Payment received — your balance will update shortly.
        </p>
      )}

      {params.deposit === 'cancelled' && (
        <p className="p-4 rounded-xl bg-zinc-800 text-zinc-300">
          Payment cancelled. No charge was made.
        </p>
      )}

      <DepositForm />
    </main>
  )
}
