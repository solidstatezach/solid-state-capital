import { requireAdmin } from '@/lib/supabase/admin'
import WithdrawalsClient from './client'

export default async function WithdrawalsPage() {
  await requireAdmin()

  return <WithdrawalsClient />
}
