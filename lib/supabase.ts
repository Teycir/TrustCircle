import { createClient, SupabaseClient } from '@supabase/supabase-js'

export interface CapsuleRecord {
  id?: string
  creator_pubkey: string
  approver_pubkey: string
  title?: string
  notes?: string
  payload_cid: string
  metadata: any
  status?: string
  created_at?: string
  unlocked_at?: string
}

export class TrustCircleDB {
  private client: SupabaseClient

  constructor(url: string, key: string) {
    this.client = createClient(url, key)
  }

  async saveCapsule(record: CapsuleRecord): Promise<string> {
    const { data, error } = await this.client
      .from('capsules')
      .insert(record)
      .select('id')
      .single()

    if (error) throw new Error(`Failed to save capsule: ${error.message}`)
    return data.id
  }

  async getCapsule(id: string): Promise<CapsuleRecord> {
    const { data, error } = await this.client
      .from('capsules')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(`Failed to get capsule: ${error.message}`)
    return data
  }

  async listCapsules(filters?: { creator?: string; approver?: string }): Promise<CapsuleRecord[]> {
    let query = this.client.from('capsules').select('*')

    if (filters?.creator) query = query.eq('creator_pubkey', filters.creator)
    if (filters?.approver) query = query.eq('approver_pubkey', filters.approver)

    const { data, error } = await query

    if (error) throw new Error(`Failed to list capsules: ${error.message}`)
    return data || []
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const { error } = await this.client
      .from('capsules')
      .update({ status, unlocked_at: status === 'unlocked' ? new Date().toISOString() : null })
      .eq('id', id)

    if (error) throw new Error(`Failed to update status: ${error.message}`)
  }
}
