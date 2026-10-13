import Nav from '@/components/investor/Nav'
import MarketTicker from '@/components/investor/MarketTicker'

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <MarketTicker />
      <div className="mx-auto max-w-6xl px-4 md:px-6 pb-12">
        <div className="py-4">
          <Nav />
        </div>
        {children}
      </div>
    </div>
  )
}
