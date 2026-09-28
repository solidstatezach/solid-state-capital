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

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="text-zinc-400">
            Total Exposure
          </div>

          <div className="text-3xl font-bold mt-2">
            $1,250,000
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="text-zinc-400">
            Daily PnL
          </div>

          <div className="text-3xl font-bold text-green-400 mt-2">
            +$12,450
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="text-zinc-400">
            Open Positions
          </div>

          <div className="text-3xl font-bold mt-2">
            4
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="text-zinc-400">
            Win Rate
          </div>

          <div className="text-3xl font-bold mt-2">
            72%
          </div>
        </div>

      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">

        <h2 className="text-2xl font-bold mb-4">
          Current Positions
        </h2>

        <div className="space-y-3">

          <div className="flex justify-between border-b border-zinc-800 pb-3">
            <span>Bitcoin (BTC)</span>
            <span className="text-green-400">+12.4%</span>
          </div>

          <div className="flex justify-between border-b border-zinc-800 pb-3">
            <span>Ethereum (ETH)</span>
            <span className="text-green-400">+8.2%</span>
          </div>

          <div className="flex justify-between border-b border-zinc-800 pb-3">
            <span>Solana (SOL)</span>
            <span className="text-red-400">-1.4%</span>
          </div>

          <div className="flex justify-between border-b border-zinc-800 pb-3">
            <span>Chainlink (LINK)</span>
            <span className="text-green-400">+5.1%</span>
          </div>

        </div>

      </div>

    </main>
  )
}
