import { requireAdmin } from '@/lib/supabase/admin'
import NewInvestorForm from './NewInvestorForm'

export default async function NewInvestorPage() {
  await requireAdmin()

  return <NewInvestorForm />
}
