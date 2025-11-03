import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
});

export interface CapsuleRecord {
  id?: string;
  creator_pubkey: string;
  approver_pubkey: string;
  title?: string;
  notes?: string;
  payload_cid: string;
  metadata: any;
  status?: string;
  created_at?: string;
  unlocked_at?: string;
  expires_at?: string;
}

export class TrustCircleDB {
  private client: SupabaseClient;
  private pinataClient?: any;

  constructor(url: string, key: string, pinataClient?: any) {
    this.client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    this.pinataClient = pinataClient;
  }

  async saveCapsule(record: CapsuleRecord): Promise<string> {
    const { data, error } = await this.client
      .from("capsules")
      .insert(record)
      .select("id")
      .single();

    if (error) throw new Error(`Failed to save capsule: ${error.message}`);
    return data.id;
  }

  async getCapsule(id: string): Promise<CapsuleRecord> {
    const { data, error } = await this.client
      .from("capsules")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(`Failed to get capsule: ${error.message}`);
    return data;
  }

  async listCapsules(filters?: {
    creator?: string;
    approver?: string;
  }): Promise<CapsuleRecord[]> {
    let query = this.client.from("capsules").select("*");

    if (filters?.creator) query = query.eq("creator_pubkey", filters.creator);
    if (filters?.approver)
      query = query.eq("approver_pubkey", filters.approver);

    const { data, error } = await query;

    if (error) throw new Error(`Failed to list capsules: ${error.message}`);
    return data || [];
  }

  async deleteExpiredCapsules(): Promise<number> {
    const { data: expired } = await this.client
      .from("capsules")
      .select("id, payload_cid")
      .lt("expires_at", new Date().toISOString())
      .not("expires_at", "is", null);

    if (!expired?.length) return 0;

    for (const capsule of expired) {
      await this.deleteCapsule(capsule.id);
    }

    return expired.length;
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const { error } = await this.client
      .from("capsules")
      .update({
        status,
        unlocked_at: status === "unlocked" ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (error) throw new Error(`Failed to update status: ${error.message}`);
  }

  async deleteCapsule(id: string): Promise<void> {
    const capsule = await this.getCapsule(id);

    const { error } = await this.client.from("capsules").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete capsule: ${error.message}`);

    if (this.pinataClient && capsule.payload_cid) {
      try {
        await this.pinataClient.unpin(capsule.payload_cid);
      } catch (err) {
        console.error("Failed to unpin from IPFS:", err);
      }
    }
  }
}
