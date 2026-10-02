import Nav from '@/components/investor/Nav'
import MarketTicker from '@/components/investor/MarketTicker'

export default function WithdrawPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <Nav />
      <MarketTicker />

      <h1 className="text-4xl font-bold text-cyan-400">
        Withdraw Funds
      </h1>

      <form
        action="/api/withdraw"
        method="POST"
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4"
      >
        <input
          name="amount"
          type="number"
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
          className="px-4 py-2 rounded bg-cyan-600"
        >
          Submit Withdrawal
        </button>
      </form>
    </main>
  )
}
