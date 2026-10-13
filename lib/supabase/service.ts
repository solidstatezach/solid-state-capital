import { createClient } from '@supabase/supabase-js'

/**
 * Service-role client for server contexts with no user session
 * (e.g. Stripe webhooks). Bypasses RLS — only use where the caller
 * is already authenticated by other means (webhook signature).
 * Never import from client components.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  return createClient(url, serviceKey)
}
