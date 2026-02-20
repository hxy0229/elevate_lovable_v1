import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiting (resets on cold start, but provides basic protection)
const attemptTracker = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = attemptTracker.get(key);
  if (!record || now > record.resetAt) {
    attemptTracker.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  record.count++;
  return record.count > MAX_ATTEMPTS;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Rate limit by user ID to prevent brute force
    if (isRateLimited(userId)) {
      return new Response(JSON.stringify({ error: "Too many attempts. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { invite_code } = await req.json();

    if (!invite_code || typeof invite_code !== "string" || invite_code.length > 100) {
      return new Response(JSON.stringify({ error: "Missing or invalid invite code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminCode = Deno.env.get("ADMIN_INVITE_CODE");
    const memberCode = Deno.env.get("MEMBER_INVITE_CODE");

    const trimmedCode = invite_code.trim();
    let assignedRole: "admin" | "user" | null = null;

    if (adminCode && trimmedCode === adminCode.trim()) {
      assignedRole = "admin";
    } else if (memberCode && trimmedCode === memberCode.trim()) {
      assignedRole = "user";
    }

    if (!assignedRole) {
      // Add delay on failed attempts to slow brute force
      await new Promise((r) => setTimeout(r, 2000));
      console.log("Invalid invite code attempt by user:", userId);
      return new Response(JSON.stringify({ error: "Invalid invite code" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to insert role
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if already has this role
    const { data: existing } = await adminClient
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", assignedRole)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true, role: assignedRole, message: "Role already assigned" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: insertError } = await adminClient
      .from("user_roles")
      .insert({ user_id: userId, role: assignedRole });

    if (insertError) {
      console.error("Failed to insert role:", insertError);
      return new Response(JSON.stringify({ error: "Failed to assign role" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Role '${assignedRole}' granted to user:`, userId);
    return new Response(JSON.stringify({ success: true, role: assignedRole }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
