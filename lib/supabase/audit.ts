import type { SupabaseClient } from '@supabase/supabase-js'

type AuditEntry = {
  action: string
  entity: string
  entity_id?: string
  before?: unknown
  after?: unknown
  notes?: string
}

/**
 * Best-effort audit write. Never throws: a logging failure must not
 * break the mutation it describes. Callers should still prefer writing
 * audit rows inside the same DB function/transaction when atomicity
 * matters (see execute_trade()).
 */
export async function logAudit(
  supabase: SupabaseClient,
  entry: AuditEntry
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('audit_log').insert({
      actor_id: user?.id ?? null,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entity_id ?? null,
      before: entry.before ?? null,
      after: entry.after ?? null,
      notes: entry.notes ?? null,
    })

    if (error) {
      console.error('audit_log insert failed:', error.message)
    }
  } catch (error) {
    console.error(
      'audit_log insert failed:',
      error instanceof Error ? error.message : error
    )
  }
}
