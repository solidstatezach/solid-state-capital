import { createClient } from '@/lib/supabase/server'

export async function getCurrentInvestor() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: investor, error } = await supabase
    .from('investors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Failed to load investor:', error)
    return null
  }

  return investor
}
