import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const formData = await req.formData()

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
    return NextResponse.json(error, { status: 500 })
  }

  return NextResponse.redirect(
    new URL('/investor/withdraw', req.url)
  )
}
