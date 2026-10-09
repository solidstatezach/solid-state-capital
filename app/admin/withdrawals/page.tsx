import { requireAdmin } from '@/lib/supabase/admin'
import WithdrawalsClient from './new/client'

export const dynamic = 'force-dynamic'

export default async function WithdrawalsPage() {
  await requireAdmin()
  return <WithdrawalsClient />
}
