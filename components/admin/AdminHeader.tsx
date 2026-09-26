export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">
            Solid State Capital
          </h1>

          <p className="text-zinc-500 text-sm">
            Investor Management Platform
          </p>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition">
            Add Investor
          </button>

          <button className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition">
            Add Transaction
          </button>
        </div>
      </div>
    </header>
  )
}
