'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Wallet,
  TrendingUp,
  Shield,
  Banknote,
  PiggyBank,
  LineChart,
} from 'lucide-react'
import SignOutButton from '@/components/ui/SignOutButton'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/investors', label: 'Investors', icon: Users },
  { href: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/admin/portfolios', label: 'Portfolios', icon: Wallet },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: Banknote },
  { href: '/admin/deposits/new', label: 'Deposits', icon: PiggyBank },
  { href: '/admin/trading', label: 'Trading', icon: TrendingUp },
  { href: '/admin/performance', label: 'Performance', icon: LineChart },
  { href: '/admin/system', label: 'System', icon: Shield },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-72 min-h-screen border-r border-zinc-800 bg-zinc-950/90 backdrop-blur-xl p-6 flex flex-col">
      <div className="mb-10">
        <h2 className="text-4xl font-black text-cyan-400">SSC</h2>
        <p className="text-zinc-500 text-sm mt-1">Solid State Capital</p>
      </div>

      <nav className="space-y-2 flex-1">
        {links.map((link) => {
          const Icon = link.icon
          const active =
            pathname === link.href ||
            (link.href !== '/admin' && pathname.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 border transition-all duration-200 ${
                active
                  ? 'bg-cyan-950/50 border-cyan-500/40 text-white'
                  : 'text-zinc-300 bg-zinc-900/50 hover:bg-cyan-950/40 hover:border-cyan-500/30 border-transparent'
              }`}
            >
              <Icon size={18} className={active ? 'text-cyan-400' : ''} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="text-zinc-500 text-xs">Platform Status</div>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400" />
          <span className="font-semibold text-green-400">Online</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800">
        <SignOutButton variant="sidebar" />
      </div>
    </aside>
  )
}
