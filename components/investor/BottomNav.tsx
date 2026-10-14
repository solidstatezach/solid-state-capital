'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Ellipsis,
  X,
  LineChart,
  ArrowLeftRight,
  ShieldCheck,
} from 'lucide-react'
import SignOutButton from '@/components/ui/SignOutButton'

// Mobile bottom tab bar for investors. Phone-first: the sections a
// user needs every day live one thumb-tap away; the rest sit in the
// More sheet. Desktop keeps the top tab row instead (see Nav).
const PRIMARY = [
  { href: '/investor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/investor/portfolio', label: 'Portfolio', icon: Wallet },
  { href: '/investor/deposit', label: 'Deposit', icon: ArrowDownToLine },
  { href: '/investor/withdraw', label: 'Withdraw', icon: ArrowUpFromLine },
]

export default function BottomNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const moreLinks = [
    { href: '/investor/performance', label: 'Performance', icon: LineChart },
    { href: '/investor/transactions', label: 'Transactions', icon: ArrowLeftRight },
    ...(isAdmin
      ? [{ href: '/admin', label: 'Admin', icon: ShieldCheck }]
      : []),
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-zinc-800 bg-zinc-950 p-4 pb-8">
            <div className="flex items-center justify-between px-2 pb-3">
              <span className="text-sm font-bold text-zinc-400">More</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-full bg-zinc-800 p-2 text-zinc-300"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-1">
              {moreLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-white hover:bg-zinc-800"
                  >
                    <Icon size={18} className="text-cyan-400" />
                    {link.label}
                  </Link>
                )
              })}
              <div className="px-2 pt-1">
                <SignOutButton
                  variant="button"
                  className="w-full justify-start px-2 py-3"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-xl bottom-nav-safe">
        <div className="grid grid-cols-5">
          {PRIMARY.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${
                  active ? 'text-cyan-400' : 'text-zinc-400'
                }`}
              >
                <Icon size={22} />
                {link.label}
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${
              open ? 'text-cyan-400' : 'text-zinc-400'
            }`}
          >
            <Ellipsis size={22} />
            More
          </button>
        </div>
      </nav>
    </>
  )
}
