'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SignOutButton from '@/components/ui/SignOutButton'

export type NavLink = {
  href: string
  label: string
}

export const ADMIN_LINKS: NavLink[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/investors', label: 'Investors' },
  { href: '/admin/transactions', label: 'Transactions' },
  { href: '/admin/portfolios', label: 'Portfolios' },
  { href: '/admin/withdrawals', label: 'Withdrawals' },
  { href: '/admin/deposits/new', label: 'Deposits' },
  { href: '/admin/trading', label: 'Trading' },
  { href: '/admin/performance', label: 'Performance' },
]

export default function AdminMobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden border-b border-zinc-800 bg-zinc-950/90 overflow-x-auto">
      <div className="flex gap-1 p-2 min-w-max">
        {ADMIN_LINKS.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== '/admin' &&
              pathname.startsWith(link.href))

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${
                active
                  ? 'bg-cyan-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
        <SignOutButton variant="tab" className="ml-1" />
      </div>
    </nav>
  )
}
