import Link from 'next/link'

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
      <div className="flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">
            Solid State Capital
          </h1>

          <p className="text-zinc-500 text-sm">
            Investor Management Platform
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/admin/investors/new"
            className="rounded-lg bg-cyan-600 px-4 py-2 text-center hover:bg-cyan-500 transition"
          >
            Add Investor
          </Link>

          <Link
            href="/admin/transactions/new"
            className="rounded-lg bg-zinc-800 px-4 py-2 text-center hover:bg-zinc-700 transition"
          >
            Add Transaction
          </Link>
        </div>
      </div>
    </header>
  )
}
