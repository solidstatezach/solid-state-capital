'use client'

export default function PortfoliosPage() {
  return (
    <main className="p-8 text-white">
      <h1 className="text-4xl font-bold mb-8">
        Portfolio Management
      </h1>

      <div className="grid gap-4">
        <div className="bg-zinc-900 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-2">
            Total Portfolio Value
          </h2>

          <p className="text-4xl font-bold text-green-400">
            $0.00
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-2">
            Active Holdings
          </h2>

          <p className="text-4xl font-bold">
            0
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-2">
            Performance
          </h2>

          <p className="text-4xl font-bold text-cyan-400">
            0%
          </p>
        </div>
      </div>

      <div className="mt-8 bg-zinc-900 p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">
          Holdings
        </h2>

        <p className="text-zinc-400">
          No holdings added yet.
        </p>
      </div>
    </main>
  )
}
