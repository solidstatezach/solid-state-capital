import { requireAdmin } from '@/lib/supabase/admin'
import NewPositionForm from './form'

export default async function NewPositionPage() {
  await requireAdmin()

  return <NewPositionForm />
}
