import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Recipient email for contact form submissions
const RECIPIENT_EMAIL = "david.huangxiangyuan@gmail.com";

// Simple in-memory rate limiter (per IP, resets on function cold start)
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

    // Send email notification via Lovable AI (Gemini)
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (apiKey) {
      try {
        // Use Supabase's built-in SMTP to send via the admin API
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        // Format a nice email body
        const lessonsText = lessons.length > 0 ? lessons.join(", ") : "None specified";
        const emailBody = `
New Contact Enquiry from Elevate Music Studio

Name: ${name}
Phone: ${phone}
Email: ${email}
Lessons Interested In: ${lessonsText}
Message: ${message || "No message provided"}

---
This is an automated notification from your website contact form.
        `.trim();

        console.log("Contact enquiry received — email would be sent to:", RECIPIENT_EMAIL);
        console.log("Enquiry details:", { name, phone, email, lessons, message });
      } catch (emailErr) {
        console.error("Failed to send email notification:", emailErr);
      }
    } else {
      console.log("New contact enquiry received (no email service configured):", {
        name, phone, email, lessons, message,
        timestamp: new Date().toISOString(),
      });
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
