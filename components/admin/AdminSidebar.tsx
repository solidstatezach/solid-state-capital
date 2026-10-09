import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Wallet,
  TrendingUp,
  Shield,
  Banknote,
} from 'lucide-react'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/investors', label: 'Investors', icon: Users },
  { href: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/admin/portfolios', label: 'Portfolios', icon: Wallet },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: Banknote },
  { href: '/admin/trading', label: 'Trading', icon: TrendingUp },
  { href: '/admin/system', label: 'System', icon: Shield },
]

export default function AdminSidebar() {
  return (
    <aside className="w-72 min-h-screen border-r border-zinc-800 bg-zinc-950/90 backdrop-blur-xl p-6">
      <div className="mb-10">
        <h2 className="text-4xl font-black text-cyan-400">SSC</h2>
        <p className="text-zinc-500 text-sm mt-1">Solid State Capital</p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-zinc-300 bg-zinc-900/50 hover:bg-cyan-950/40 hover:border-cyan-500/30 border border-transparent transition-all duration-200"
            >
              <Icon size={18} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="text-zinc-500 text-xs">Platform Status</div>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400" />
          <span className="font-semibold text-green-400">Online</span>
        </div>
      </div>
    </aside>
  )
}
