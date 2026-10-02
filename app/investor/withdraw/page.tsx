import Nav from '@/components/investor/Nav'
import MarketTicker from '@/components/investor/MarketTicker'
export default function WithdrawPage() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <Nav />
      <MarketTicker />
      <h1 className="text-4xl font-bold text-cyan-400 mb-4">
        Withdraw Funds
      </h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <p className="text-zinc-400">
          Withdrawal requests coming soon.
        </p>
      </div>
    </main>
  )
}
