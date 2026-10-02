import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const formData = await request.formData()

  const amount = Number(formData.get('amount'))
  const wallet_address = String(formData.get('wallet_address'))

  const supabase = await createClient()

  const { error } = await supabase
    .from('withdrawal_requests')
    .insert({
      amount,
      wallet_address,
      status: 'pending',
    })

  if (error) {
    console.error(error)
    redirect('/investor/withdraw?error=1')
  }

  redirect('/investor/withdraw?success=1')
}
