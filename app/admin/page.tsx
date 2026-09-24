import Link from 'next/link'

export default function AdminPage() {
  return (
    <main className="p-8 text-white">
      <h1 className="text-4xl font-bold mb-8">
        Admin Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2">

        <Link
          href="/admin/investors"
          className="block p-6 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-500"
        >
          <h2 className="text-xl font-bold mb-2">
            Investors
          </h2>

          <p className="text-zinc-400">
            View and manage investors
          </p>
        </Link>

        <Link
          href="/admin/investors/new"
          className="block p-6 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-purple-500"
        >
          <h2 className="text-xl font-bold mb-2">
            Add Investor
          </h2>

          <p className="text-zinc-400">
            Create a new investor account
          </p>
        </Link>

        <Link
          href="/admin/transactions/new"
          className="block p-6 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-green-500"
        >
          <h2 className="text-xl font-bold mb-2">
            Transactions
          </h2>

          <p className="text-zinc-400">
            Record deposits, withdrawals, profits and losses
          </p>
        </Link>

        <Link
          href="/admin/trading"
          className="block p-6 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-yellow-500"
        >
          <h2 className="text-xl font-bold mb-2">
            Trading
          </h2>

          <p className="text-zinc-400">
            Trading operations and portfolio management
          </p>
        </Link>

        <Link
          href="/admin/system"
          className="block p-6 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-red-500"
        >
          <h2 className="text-xl font-bold mb-2">
            System
          </h2>

          <p className="text-zinc-400">
            System configuration and monitoring
          </p>
        </Link>

      </div>
    </main>
  )
}
