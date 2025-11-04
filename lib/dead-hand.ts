import { TrustCircleDB } from "./supabase";

export interface DeadHandConfig {
  triggerDate: Date;
}

export interface DeadHandStatus {
  enabled: boolean;
  triggerDate: Date | null;
  status: string | null;
  daysUntilTrigger: number | null;
  warningDate: Date | null;
}

export async function enableDeadHand(
  db: TrustCircleDB,
  capsuleId: string,
  config: DeadHandConfig,
  userPubkey?: string
): Promise<void> {
  await db.updateDeadHand(capsuleId, {
    dead_hand_trigger_date: config.triggerDate.toISOString(),
    dead_hand_status: undefined,
    warning_sent_at: undefined,
  }, userPubkey);
}

export async function resetDeadHandDate(
  db: TrustCircleDB,
  capsuleId: string,
  newTriggerDate: Date,
  userPubkey?: string
): Promise<void> {
  const capsule = await db.getCapsule(capsuleId, userPubkey);
  const metadata = capsule.metadata as any;
  
  const unlockCondition = metadata?.unlock_policy?.conditions?.find((c: any) => c.type === 'DATE_AFTER');
  if (unlockCondition) {
    const unlockDate = new Date(unlockCondition.value);
    if (newTriggerDate < unlockDate) {
      throw new Error('Dead hand trigger date must be on or after the unlock date');
    }
  }
  
  if (capsule.expires_at) {
    const expiryDate = new Date(capsule.expires_at);
    if (newTriggerDate > expiryDate) {
      throw new Error('Dead hand trigger date must be on or before the expiration date');
    }
  }
  
  await db.updateDeadHand(capsuleId, {
    dead_hand_trigger_date: newTriggerDate.toISOString(),
    dead_hand_status: undefined,
    warning_sent_at: undefined,
  }, userPubkey);
}

export async function disableDeadHand(
  db: TrustCircleDB,
  capsuleId: string,
  userPubkey?: string
): Promise<void> {
  await db.updateDeadHand(capsuleId, {
    dead_hand_trigger_date: undefined,
    dead_hand_status: undefined,
    warning_sent_at: undefined,
  }, userPubkey);
}

export async function getDeadHandStatus(
  db: TrustCircleDB,
  capsuleId: string,
  userPubkey?: string
): Promise<DeadHandStatus> {
  const capsule = await db.getCapsule(capsuleId, userPubkey);
  
  if (!capsule.dead_hand_trigger_date) {
    return {
      enabled: false,
      triggerDate: null,
      status: null,
      daysUntilTrigger: null,
      warningDate: null,
    };
  }

  const triggerDate = new Date(capsule.dead_hand_trigger_date);
  const now = new Date();
  const daysUntilTrigger = Math.ceil((triggerDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const warningDate = new Date(triggerDate.getTime() - 2 * 24 * 60 * 60 * 1000);

  return {
    enabled: true,
    triggerDate,
    status: capsule.dead_hand_status || null,
    daysUntilTrigger,
    warningDate,
  };
}
