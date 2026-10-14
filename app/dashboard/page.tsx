import { redirect } from 'next/navigation'

// Legacy route: the one dashboard lives at /investor now.
export default function DashboardRedirect() {
  redirect('/investor')
}
