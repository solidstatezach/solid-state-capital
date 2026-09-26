import Link from 'next/link'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/investors', label: 'Investors' },
  { href: '/admin/transactions', label: 'Transactions' },
  { href: '/admin/portfolios', label: 'Portfolios' },
  { href: '/admin/trading', label: 'Trading' },
  { href: '/admin/system', label: 'System' },
]

export default function AdminSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-zinc-950 border-r border-zinc-800 p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-cyan-400">
          SSC
        </h2>

        <p className="text-zinc-500 text-sm">
          Capital Management
        </p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="
              block
              rounded-xl
              px-4
              py-3
              bg-zinc-900
              hover:bg-cyan-950
              hover:translate-x-1
              transition-all
              duration-200
            "
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mt-10 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <p className="text-zinc-500 text-xs">
          Platform Status
        </p>

        <p className="text-green-400 font-semibold mt-1">
          Online
        </p>
      </div>
    </aside>
  )
}
