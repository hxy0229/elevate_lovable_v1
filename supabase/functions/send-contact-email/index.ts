import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RECIPIENT_EMAIL = "david.huangxiangyuan@gmail.com";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeString(str: unknown, maxLength: number): string | null {
  if (typeof str !== "string") return null;
  return str.trim().slice(0, maxLength);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") || "unknown";
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ success: false, error: "Too many requests. Please try again later." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();

    const name = sanitizeString(body.name, 100);
    const phone = sanitizeString(body.phone, 30);
    const email = sanitizeString(body.email, 255);
    const message = sanitizeString(body.message, 2000) || "";
    const lessons = Array.isArray(body.lessons)
      ? body.lessons.filter((l: unknown) => typeof l === "string").slice(0, 20).map((l: string) => l.slice(0, 50))
      : [];

    if (!name || !phone || !email) {
      return new Response(
        JSON.stringify({ success: false, error: "Name, phone, and email are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!validateEmail(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email address." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lessonsText = lessons.length > 0 ? lessons.join(", ") : "None specified";

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const htmlBody = `
      <h2>New Contact Enquiry – Elevate Music Studio</h2>
      <table style="border-collapse:collapse;font-family:sans-serif;">
        <tr><td style="padding:6px 12px;font-weight:bold;">Name</td><td style="padding:6px 12px;">${name}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;">Phone</td><td style="padding:6px 12px;">${phone}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;">Email</td><td style="padding:6px 12px;"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;">Lessons</td><td style="padding:6px 12px;">${lessonsText}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;">Message</td><td style="padding:6px 12px;">${message || "—"}</td></tr>
      </table>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Elevate Music <onboarding@resend.dev>",
        to: [RECIPIENT_EMAIL],
        subject: `New Enquiry from ${name}`,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`Resend API error [${res.status}]:`, errBody);
    } else {
      console.log("Email sent successfully to", RECIPIENT_EMAIL);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing contact enquiry:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to process enquiry" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
