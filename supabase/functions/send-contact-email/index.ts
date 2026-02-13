import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, phone, email, lessons, message } = await req.json();

    // For now, log the enquiry. Email sending can be configured later
    // when an email service (e.g. Resend, SendGrid) is integrated.
    console.log("New contact enquiry received:", {
      name,
      phone,
      email,
      lessons,
      message,
      timestamp: new Date().toISOString(),
    });

    // TODO: Integrate email service here to forward enquiry to teachers
    // Example with Resend:
    // const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    // await fetch('https://api.resend.com/emails', { ... });

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
