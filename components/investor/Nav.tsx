'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()

  const tabClass = (href: string) =>
    pathname === href
      ? 'px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold'
      : 'px-4 py-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700'

  return (
    <nav className="flex flex-wrap gap-3 mb-6">
      <Link href="/dashboard" className={tabClass('/dashboard')}>
        Dashboard
      </Link>

      <Link href="/investor/portfolio" className={tabClass('/investor/portfolio')}>
        Portfolio
      </Link>

      <Link href="/investor/performance" className={tabClass('/investor/performance')}>
        Performance
      </Link>

      <Link href="/investor/transactions" className={tabClass('/investor/transactions')}>
        Transactions
      </Link>

      <Link href="/investor/withdraw" className={tabClass('/investor/withdraw')}>
        Withdraw
      </Link>
    </nav>
  )
}
