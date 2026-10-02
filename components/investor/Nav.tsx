import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="flex flex-wrap gap-3 mb-6">
      <Link href="/dashboard" className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold">
        Dashboard
      </Link>
      <Link href="/investor/portfolio" className="px-4 py-2 rounded-xl bg-zinc-800">
        Portfolio
      </Link>
      <Link href="/investor/performance" className="px-4 py-2 rounded-xl bg-zinc-800">
        Performance
      </Link>
      <Link href="/investor/transactions" className="px-4 py-2 rounded-xl bg-zinc-800">
        Transactions
      </Link>
      <Link href="/investor/withdraw" className="px-4 py-2 rounded-xl bg-zinc-800">
        Withdraw
      </Link>
    </nav>
  )
}
