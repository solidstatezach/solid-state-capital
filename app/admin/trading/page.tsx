import StatCard from '@/components/admin/StatCard'

export default function TradingPage() {
  return (
    <main className="p-8 text-white space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-cyan-400">
          Trading Desk
        </h1>

        <p className="text-zinc-400 mt-2">
          Portfolio management and execution
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard
          title="Total Exposure"
          value="$1,250,000"
        />

        <StatCard
          title="Daily PnL"
          value="+$12,450"
          valueClassName="text-green-400"
        />

        <StatCard
          title="Open Positions"
          value="4"
        />

        <StatCard
          title="Win Rate"
          value="72%"
        />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Current Positions
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between border-b border-zinc-800 pb-3">
            <span>Bitcoin (BTC)</span>
            <span className="text-green-400">
              +12.4%
            </span>
          </div>

          <div className="flex justify-between border-b border-zinc-800 pb-3">
            <span>Ethereum (ETH)</span>
            <span className="text-green-400">
              +8.2%
            </span>
          </div>

          <div className="flex justify-between border-b border-zinc-800 pb-3">
            <span>Solana (SOL)</span>
            <span className="text-red-400">
              -1.4%
            </span>
          </div>

          <div className="flex justify-between border-b border-zinc-800 pb-3">
            <span>Chainlink (LINK)</span>
            <span className="text-green-400">
              +5.1%
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}
