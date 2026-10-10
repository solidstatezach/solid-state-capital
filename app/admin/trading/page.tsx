import { requireAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import StatCard from '@/components/admin/StatCard'
import TradeEntryForm from './TradeEntryForm'
import PositionsTable from './PositionsTable'

export default async function TradingPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: positions } = await supabase
    .from('portfolio_positions')
    .select(`
      *,
      investors (
        full_name
      )
    `)
    .order('asset')

  const { data: investors } = await supabase
    .from('investors')
    .select('id, full_name')
    .eq('status', 'active')
    .order('full_name')

  const totalValue =
    positions?.reduce(
      (sum, position) =>
        sum +
        Number(position.quantity) *
          Number(position.current_price || 0),
      0
    ) || 0

  const totalUnrealized =
    positions?.reduce(
      (sum, position) =>
        sum +
        Number(position.quantity) *
          (Number(position.current_price || 0) -
            Number(position.average_cost || 0)),
      0
    ) || 0

  return (
    <main className="space-y-8 p-8 text-white">
      <div>
        <h1 className="text-4xl font-bold text-cyan-400">
          Trading Desk
        </h1>

        <p className="text-zinc-400 mt-2">
          Portfolio management and execution
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard
          title="Positions Value"
          value={`$${totalValue.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}`}
        />

        <StatCard
          title="Unrealized P/L"
          value={`${totalUnrealized >= 0 ? '+' : ''}$${totalUnrealized.toLocaleString(
            undefined,
            { maximumFractionDigits: 2 }
          )}`}
        />

        <StatCard
          title="Open Positions"
          value={String(positions?.length || 0)}
        />
      </div>

      <TradeEntryForm investors={investors || []} />

      <PositionsTable positions={positions || []} />
    </main>
  )
}
