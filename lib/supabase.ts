import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

if (
  globalThis.window !== undefined &&
  (supabaseUrl === "placeholder" || supabaseKey === "placeholder")
) {
  console.error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage:
      globalThis.window === undefined
        ? undefined
        : globalThis.window.localStorage,
  },
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
  dead_hand_trigger_date?: string;
  dead_hand_status?: string;
  warning_sent_at?: string;
}

export interface VaultRecord {
  id?: string;
  creator_pubkey: string;
  title: string;
  notes?: string;
  document_type: string;
  issuer: string;
  document_id?: string;
  payload_cid: string;
  metadata: any;
  file_name?: string;
  file_size?: number;
  created_at?: string;
  updated_at?: string;
}

export class TrustCircleDB {
  private readonly client: SupabaseClient;
  private readonly pinataClient?: any;
  private readonly analyticsCache = new Map<
    string,
    { data: any; timestamp: number }
  >();
  private readonly listCache = new Map<
    string,
    { data: CapsuleRecord[]; timestamp: number }
  >();
  private readonly capsuleCache = new Map<
    string,
    { data: CapsuleRecord; timestamp: number }
  >();
  private readonly cacheTTL = 5 * 60 * 1000;

  constructor(url: string, key: string, pinataClient?: any) {
    this.client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    this.pinataClient = pinataClient;
  }

  async saveCapsule(
    record: CapsuleRecord,
    userPubkey?: string,
  ): Promise<string> {
    const { data, error } = await this.client
      .from("capsules")
      .insert(record)
      .select("*")
      .single();

    if (error) {
      console.error("Insert error details:", error);
      throw new Error(`Failed to save capsule: ${error.message}`);
    }
    this.analyticsCache.delete(record.creator_pubkey);
    this.analyticsCache.delete(record.approver_pubkey);
    this.listCache.delete(`${record.creator_pubkey}_`);
    this.listCache.delete(`_${record.approver_pubkey}`);
    this.capsuleCache.set(data.id, { data, timestamp: Date.now() });
    return data.id;
  }

  async getCapsule(id: string, userPubkey?: string): Promise<CapsuleRecord> {
    const cached = this.capsuleCache.get(id);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    const { data, error } = await this.client
      .from("capsules")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to get capsule: ${error.message}`);
    if (!data) throw new Error("Capsule not found");

    this.capsuleCache.set(id, { data, timestamp: Date.now() });
    return data;
  }

  async listCapsules(filters?: {
    creator?: string;
    approver?: string;
  }): Promise<CapsuleRecord[]> {
    const cacheKey = `${filters?.creator || ""}_${filters?.approver || ""}`;
    const cached = this.listCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    let query = this.client.from("capsules").select("*");

    if (filters?.creator) query = query.eq("creator_pubkey", filters.creator);
    if (filters?.approver)
      query = query.eq("approver_pubkey", filters.approver);

    const { data, error } = await query;

    if (error) throw new Error(`Failed to list capsules: ${error.message}`);
    const capsules = data || [];

    this.listCache.set(cacheKey, { data: capsules, timestamp: Date.now() });
    return capsules;
  }

  async deleteExpiredCapsules(): Promise<number> {
    const { data: expired } = await this.client
      .from("capsules")
      .select("id, payload_cid, creator_pubkey")
      .lt("expires_at", new Date().toISOString())
      .not("expires_at", "is", null);

    if (!expired?.length) return 0;

    for (const capsule of expired) {
      await this.deleteCapsule(capsule.id, capsule.creator_pubkey);
    }

    return expired.length;
  }

  async updateStatus(
    id: string,
    status: string,
    userPubkey?: string,
  ): Promise<void> {
    const capsule = await this.getCapsule(id, userPubkey);
    const updates: any = {
      status,
      unlocked_at: status === "unlocked" ? new Date().toISOString() : null,
    };

    if (status === "unlocked") {
      updates.dead_hand_trigger_date = null;
      updates.dead_hand_status = null;
      updates.warning_sent_at = null;
    }

    const { error } = await this.client
      .from("capsules")
      .update(updates)
      .eq("id", id);

    if (error) throw new Error(`Failed to update status: ${error.message}`);
    this.capsuleCache.delete(id);
    this.analyticsCache.delete(capsule.creator_pubkey);
    this.analyticsCache.delete(capsule.approver_pubkey);
    this.listCache.delete(`${capsule.creator_pubkey}_`);
    this.listCache.delete(`_${capsule.approver_pubkey}`);
  }

  async deleteCapsule(id: string, userPubkey?: string): Promise<void> {
    const capsule = await this.getCapsule(id, userPubkey);

    const { error } = await this.client.from("capsules").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete capsule: ${error.message}`);

    this.capsuleCache.delete(id);
    this.analyticsCache.delete(capsule.creator_pubkey);
    this.analyticsCache.delete(capsule.approver_pubkey);
    this.listCache.delete(`${capsule.creator_pubkey}_`);
    this.listCache.delete(`_${capsule.approver_pubkey}`);

    if (this.pinataClient && capsule.payload_cid) {
      try {
        await this.pinataClient.unpin(capsule.payload_cid);
      } catch (err) {
        console.error("Failed to unpin from IPFS:", err);
      }
    }
  }

  async updateDeadHand(
    id: string,
    updates: Partial<CapsuleRecord>,
    userPubkey?: string,
  ): Promise<void> {
    const capsule = await this.getCapsule(id, userPubkey);
    const { error } = await this.client
      .from("capsules")
      .update(updates)
      .eq("id", id);

    if (error) throw new Error(`Failed to update dead hand: ${error.message}`);
    this.capsuleCache.delete(id);
    this.analyticsCache.delete(capsule.creator_pubkey);
    this.listCache.delete(`${capsule.creator_pubkey}_`);
  }

  async getDeadHandCapsules(status?: string): Promise<CapsuleRecord[]> {
    let query = this.client
      .from("capsules")
      .select("*")
      .not("dead_hand_trigger_date", "is", null);

    if (status) {
      query = query.eq("dead_hand_status", status);
    }

    const { data, error } = await query;

    if (error)
      throw new Error(`Failed to get dead hand capsules: ${error.message}`);
    return data || [];
  }

  async getAnalytics(userPubkey: string) {
    const cached = this.analyticsCache.get(userPubkey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    const sevenDaysFromNow = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const [created, received, unlocked, expiring, deadHand] = await Promise.all(
      [
        this.client
          .from("capsules")
          .select("id", { count: "exact", head: true })
          .eq("creator_pubkey", userPubkey),
        this.client
          .from("capsules")
          .select("id", { count: "exact", head: true })
          .eq("approver_pubkey", userPubkey),
        this.client
          .from("capsules")
          .select("created_at,unlocked_at")
          .eq("creator_pubkey", userPubkey)
          .eq("status", "unlocked"),
        this.client
          .from("capsules")
          .select("id", { count: "exact", head: true })
          .eq("creator_pubkey", userPubkey)
          .lt("expires_at", sevenDaysFromNow)
          .not("expires_at", "is", null),
        this.client
          .from("capsules")
          .select("dead_hand_status")
          .eq("creator_pubkey", userPubkey)
          .not("dead_hand_trigger_date", "is", null),
      ],
    );

    let totalUnlockTime = 0;
    const unlockedData = unlocked.data || [];
    for (const c of unlockedData) {
      if (c.unlocked_at && c.created_at) {
        totalUnlockTime +=
          new Date(c.unlocked_at).getTime() - new Date(c.created_at).getTime();
      }
    }

    const deadHandData = deadHand.data || [];
    const deadHandActive = deadHandData.filter(
      (c) =>
        !c.dead_hand_status ||
        c.dead_hand_status === "warning_sent" ||
        c.dead_hand_status === "grace_period",
    ).length;
    const deadHandTriggered = deadHandData.filter(
      (c) => c.dead_hand_status === "triggered",
    ).length;

    const result = {
      totalCreated: created.count || 0,
      totalReceived: received.count || 0,
      totalUnlocked: unlockedData.length,
      avgUnlockTime:
        unlockedData.length > 0
          ? totalUnlockTime / unlockedData.length / (1000 * 60 * 60 * 24)
          : 0,
      expiringSoon: expiring.count || 0,
      deadHandEnabled: deadHandData.length,
      deadHandActive,
      deadHandTriggered,
    };

    this.analyticsCache.set(userPubkey, {
      data: result,
      timestamp: Date.now(),
    });
    return result;
  }

  async saveVault(record: VaultRecord, userPubkey?: string): Promise<string> {
    const { data, error } = await this.client
      .from("vaults")
      .insert(record)
      .select("id")
      .single();

    if (error) {
      console.error("Insert error details:", error);
      throw new Error(`Failed to save vault: ${error.message}`);
    }
    return data.id;
  }

  async getVault(id: string): Promise<VaultRecord> {
    const { data, error } = await this.client
      .from("vaults")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to get vault: ${error.message}`);
    if (!data) throw new Error("Vault not found");

    return data;
  }

  async listVaults(creatorPubkey: string): Promise<VaultRecord[]> {
    const { data, error } = await this.client
      .from("vaults")
      .select("*")
      .eq("creator_pubkey", creatorPubkey)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to list vaults: ${error.message}`);
    return data || [];
  }

  async deleteVault(id: string, userPubkey?: string): Promise<void> {
    const vault = await this.getVault(id);

    const { error } = await this.client.from("vaults").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete vault: ${error.message}`);

    if (this.pinataClient && vault.payload_cid) {
      try {
        await this.pinataClient.unpin(vault.payload_cid);
      } catch (err) {
        console.error("Failed to unpin from IPFS:", err);
      }
    }
  }

  async syncCapsulesWithIPFS(pinata: any): Promise<void> {
    const { data } = await this.client
      .from("capsules")
      .select("id, payload_cid");
    if (!data) return;

    const pinnedFiles = await pinata.listFiles();
    const pinnedCids = new Set(pinnedFiles.map((f: any) => f.ipfs_pin_hash));

    for (const capsule of data) {
      if (!pinnedCids.has(capsule.payload_cid)) {
        await this.client.from("capsules").delete().eq("id", capsule.id);
        console.log(`[DB] Removed orphaned capsule ${capsule.id}`);
      }
    }
  }

  async syncVaultsWithIPFS(pinata: any): Promise<void> {
    const { data } = await this.client.from("vaults").select("id, payload_cid");
    if (!data) return;

    const pinnedFiles = await pinata.listFiles();
    const pinnedCids = new Set(pinnedFiles.map((f: any) => f.ipfs_pin_hash));

    for (const vault of data) {
      if (!pinnedCids.has(vault.payload_cid)) {
        await this.client.from("vaults").delete().eq("id", vault.id);
        console.log(`[DB] Removed orphaned vault ${vault.id}`);
      }
    }
  }
}
