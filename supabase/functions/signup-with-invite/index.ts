import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limiting by IP: max 5 attempts per hour
const attemptTracker = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000;

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
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: "Too many signup attempts. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, password, display_name, invite_code } = await req.json();

    // --- Validate inputs ---
    if (!email || !password || !display_name || !invite_code) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (typeof invite_code !== "string" || invite_code.length > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid invite code format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Validate invite code BEFORE creating any user ---
    const adminCode = Deno.env.get("ADMIN_INVITE_CODE");
    const memberCode = Deno.env.get("MEMBER_INVITE_CODE");
    const trimmed = invite_code.trim();

    let assignedRole: "admin" | "user" | null = null;
    if (adminCode && trimmed === adminCode.trim()) assignedRole = "admin";
    else if (memberCode && trimmed === memberCode.trim()) assignedRole = "user";

    if (!assignedRole) {
      // Delay to slow brute force
      await new Promise((r) => setTimeout(r, 2000));
      console.log("Signup blocked — invalid invite code from IP:", ip);
      return new Response(
        JSON.stringify({ error: "Invalid invite code. Please contact an admin to get access." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Create the user using service role (bypasses email confirm if needed) ---
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: email.trim(),
      password,
      user_metadata: { display_name: display_name.trim() },
      email_confirm: true, // auto-confirm since invite code proves legitimacy
    });

    if (createError) {
      const msg = createError.message?.includes("already registered") || createError.message?.includes("already been registered")
        ? "This email is already registered."
        : createError.message;
      return new Response(
        JSON.stringify({ error: msg }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = newUser.user!.id;

    // --- Assign role ---
    const { error: roleError } = await adminClient
      .from("user_roles")
      .insert({ user_id: userId, role: assignedRole });

    if (roleError) {
      // Clean up: delete the user we just created so we don't leave orphans
      await adminClient.auth.admin.deleteUser(userId);
      console.error("Failed to assign role, user deleted:", roleError);
      return new Response(
        JSON.stringify({ error: "Failed to assign role. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Sign in to get a session for the client ---
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError || !signInData.session) {
      // User created and role assigned — they just need to sign in manually
      console.log("User created but auto-signin failed:", signInError?.message);
      return new Response(
        JSON.stringify({ success: true, role: assignedRole, session: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`User created with role '${assignedRole}':`, userId);
    return new Response(
      JSON.stringify({ success: true, role: assignedRole, session: signInData.session }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
