import { requireAdmin } from '@/lib/supabase/admin'
import NewDepositForm from './form'

export default async function NewDepositPage() {
  await requireAdmin()

  return <NewDepositForm />
}
