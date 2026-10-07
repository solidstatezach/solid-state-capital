import { requireAdmin } from '@/lib/supabase/admin'
import NewTransactionForm from './form'

export default async function NewTransactionPage() {
  await requireAdmin()

  return <NewTransactionForm />
}
