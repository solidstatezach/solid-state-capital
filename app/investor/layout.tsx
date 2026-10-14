import Nav from '@/components/investor/Nav'
import BottomNav from '@/components/investor/BottomNav'
import MarketTicker from '@/components/investor/MarketTicker'
import { createClient } from '@/lib/supabase/server'

export default async function InvestorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Admin cross-link: admins get an Admin tab in the investor nav and
  // in the mobile bottom nav's More sheet, so every section is
  // reachable from every other section. Best-effort — a failure here
  // must never block the page.
  let isAdmin = false
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle()
      isAdmin = !!profile?.is_admin
    }
  } catch {
    isAdmin = false
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <MarketTicker />
      <div className="mx-auto max-w-6xl px-4 md:px-6 pb-28 md:pb-12">
        <div className="py-4">
          <Nav isAdmin={isAdmin} />
        </div>
        {children}
      </div>
      <BottomNav isAdmin={isAdmin} />
    </div>
  )
}
