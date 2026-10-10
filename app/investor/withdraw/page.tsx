import { redirect } from 'next/navigation'
import Nav from '@/components/investor/Nav'
import MarketTicker from '@/components/investor/MarketTicker'
import { createClient } from '@/lib/supabase/server'
import { getCurrentInvestor } from '@/lib/supabase/currentInvestor'
import { formatMoney } from '@/lib/portfolio'

const FEEDBACK: Record<string, string> = {
  invalid_amount: 'Please enter a valid amount greater than zero.',
  missing_wallet: 'Please enter a wallet address.',
  insufficient_funds:
    'Insufficient balance for that withdrawal amount.',
  '1': 'Something went wrong submitting your request. Please try again.',
}

export default async function WithdrawPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string
    success?: string
  }>
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
  const errorMsg = params.error
    ? FEEDBACK[params.error] ||
      'Something went wrong. Please try again.'
    : null

  const { data: requests } = await supabase
    .from('withdrawal_requests')
    .select('id, amount, wallet_address, status, created_at')
    .eq('investor_id', investor.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <Nav />
      <MarketTicker />

      <h1 className="text-4xl font-bold text-cyan-400">
        Withdraw Funds
      </h1>

      <p className="text-zinc-400">
        Available balance:{' '}
        <span className="text-white font-bold">
          {formatMoney(investor.balance)}
        </span>
      </p>

      {errorMsg && (
        <div className="bg-red-900/40 border border-red-700 rounded-xl p-4 text-red-300">
          {errorMsg}
        </div>
      )}

      {params.success && (
        <div className="bg-green-900/40 border border-green-700 rounded-xl p-4 text-green-300">
          Withdrawal request submitted. An administrator will
          review it shortly.
        </div>
      )}

      <form
        action="/api/withdraw"
        method="POST"
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4"
      >
        <input
          name="amount"
          type="number"
          min="0"
          step="any"
          placeholder="Amount"
          required
          className="w-full p-3 rounded bg-zinc-800"
        />

        <input
          name="wallet_address"
          type="text"
          placeholder="Wallet Address"
          required
          className="w-full p-3 rounded bg-zinc-800"
        />

        <button
          type="submit"
          className="px-4 py-2 rounded bg-cyan-600 font-bold"
        >
          Submit Withdrawal
        </button>
      </form>

      <div>
        <h2 className="text-2xl font-bold mb-4">
          Request History
        </h2>

        {requests && requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((r) => (
              <div
                key={r.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-wrap justify-between gap-3"
              >
                <div>
                  <div className="font-bold">
                    {formatMoney(r.amount)}
                  </div>

                  <div className="text-sm text-zinc-500 break-all">
                    {r.wallet_address}
                  </div>

                  <div className="text-xs text-zinc-600 mt-1">
                    {new Date(
                      r.created_at
                    ).toLocaleString()}
                  </div>
                </div>

                <span
                  className={`h-fit px-3 py-1 rounded-full text-sm font-bold ${
                    r.status === 'approved'
                      ? 'bg-green-900/50 text-green-300'
                      : r.status === 'rejected'
                        ? 'bg-red-900/50 text-red-300'
                        : 'bg-yellow-900/50 text-yellow-300'
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500">
            No withdrawal requests yet.
          </p>
        )}
      </div>
    </main>
  )
}
