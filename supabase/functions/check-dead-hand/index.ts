/// <reference types="https://deno.land/x/deno@v1.30.0/cli/tsc/dts/lib.deno.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createNotification(capsuleId: string, type: string, message: string) {
  await supabase.from("notifications").insert({
    capsule_id: capsuleId,
    type,
    message,
    created_at: new Date().toISOString(),
    read: false
  });
}

serve(async (_req: Request) => {
  try {
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const { data: warningCapsules } = await supabase
      .from("capsules")
      .select("*")
      .lte("dead_hand_trigger_date", twoDaysFromNow.toISOString())
      .gte("dead_hand_trigger_date", now.toISOString())
      .is("dead_hand_status", null);

    for (const capsule of warningCapsules || []) {
      await createNotification(
        capsule.id,
        "warning",
        `Dead Hand Warning: "${capsule.title || "Untitled"}" will auto-unlock in 2 days. Reset the trigger date in your Dashboard to prevent this.`
      );

      await supabase
        .from("capsules")
        .update({
          dead_hand_status: "warning_sent",
          warning_sent_at: now.toISOString(),
        })
        .eq("id", capsule.id);
    }

    const { data: graceCapsules } = await supabase
      .from("capsules")
      .select("*")
      .lte("dead_hand_trigger_date", now.toISOString())
      .eq("dead_hand_status", "warning_sent");

    for (const capsule of graceCapsules || []) {
      await supabase
        .from("capsules")
        .update({ dead_hand_status: "grace_period" })
        .eq("id", capsule.id);
    }

    const { data: triggerCapsules } = await supabase
      .from("capsules")
      .select("*")
      .eq("dead_hand_status", "grace_period");

    for (const capsule of triggerCapsules || []) {
      const triggerDate = new Date(capsule.dead_hand_trigger_date);
      const gracePeriodEnd = new Date(
        triggerDate.getTime() + 2 * 24 * 60 * 60 * 1000,
      );

      if (now >= gracePeriodEnd) {
        await createNotification(
          capsule.id,
          "triggered",
          `Dead Hand Triggered: "${capsule.title || "Untitled"}" has been automatically unlocked. The capsule is now available in the Unlock page.`
        );

        await supabase
          .from("capsules")
          .update({
            dead_hand_status: "triggered",
            status: "unlocked",
            unlocked_at: now.toISOString(),
          })
          .eq("id", capsule.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        warnings: warningCapsules?.length || 0,
        grace: graceCapsules?.length || 0,
        triggered:
          triggerCapsules?.filter((c: any) => {
            const triggerDate = new Date(c.dead_hand_trigger_date);
            const gracePeriodEnd = new Date(
              triggerDate.getTime() + 2 * 24 * 60 * 60 * 1000,
            );
            return now >= gracePeriodEnd;
          }).length || 0,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
