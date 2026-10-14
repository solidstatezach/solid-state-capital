'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SignOutButton from '@/components/ui/SignOutButton'

export default function Nav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()

  const tabClass = (href: string) =>
    pathname === href
      ? 'px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold'
      : 'px-4 py-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700'

  return (
    // Desktop top tabs. On mobile the bottom nav owns navigation,
    // so this row stays hidden there instead of wrapping into 3 rows.
    <nav className="hidden md:flex flex-wrap gap-3 mb-6">
      <Link href="/investor" className={tabClass('/investor')}>
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

      <Link href="/investor/deposit" className={tabClass('/investor/deposit')}>
        Deposit
      </Link>

      {isAdmin && (
        <Link href="/admin" className={tabClass('/admin')}>
          Admin
        </Link>
      )}

      <div className="ml-auto">
        <SignOutButton variant="tab" />
      </div>
    </nav>
  )
}
