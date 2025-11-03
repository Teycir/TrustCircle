import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const pinataJwt = Deno.env.get("PINATA_JWT")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: expired } = await supabase
      .from("capsules")
      .select("id, payload_cid")
      .lt("expires_at", new Date().toISOString())
      .not("expires_at", "is", null);

    if (!expired?.length) {
      return new Response(JSON.stringify({ deleted: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let deleted = 0;
    for (const capsule of expired) {
      await supabase.from("capsules").delete().eq("id", capsule.id);

      try {
        await fetch(
          `https://api.pinata.cloud/pinning/unpin/${capsule.payload_cid}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${pinataJwt}` },
          },
        );
      } catch (err) {
        console.error(`Failed to unpin ${capsule.payload_cid}:`, err);
      }

      deleted++;
    }

    return new Response(JSON.stringify({ deleted }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
