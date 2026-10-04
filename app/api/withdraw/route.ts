import { createClient } from '@/lib/supabase/server'
import { getCurrentInvestor } from '@/lib/supabase/currentInvestor'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const formData = await request.formData()

  const amount = Number(formData.get('amount'))
  const wallet_address = String(
    formData.get('wallet_address') || ''
  ).trim()

  if (!amount || amount <= 0) {
    redirect('/investor/withdraw?error=invalid_amount')
  }

  if (!wallet_address) {
    redirect('/investor/withdraw?error=missing_wallet')
  }

  const supabase = await createClient()

  const investor = await getCurrentInvestor()

  if (!investor) {
    redirect('/login')
  }

  const availableBalance = Number(investor.balance || 0)

  if (amount > availableBalance) {
    redirect('/investor/withdraw?error=insufficient_funds')
  }

  const { error } = await supabase
    .from('withdrawal_requests')
    .insert({
      investor_id: investor.id,
      amount,
      wallet_address,
      status: 'pending',
    })

  if (error) {
    console.error('Withdrawal request failed:', error)
    redirect('/investor/withdraw?error=1')
  }

  redirect('/investor/withdraw?success=1')
}
