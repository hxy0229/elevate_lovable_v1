import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { sessionName, theme, date, time, participants, songList } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are a creative poster designer. Generate a beautiful text-based activity poster for a music rehearsal session. Use emojis and creative formatting. The poster should be in both English and Chinese.

Session Details:
- Name: ${sessionName}
- Theme: ${theme || 'No specific theme'}
- Date: ${date}
- Time: ${time}
- Participants (${participants.length}): ${participants.map((p: any) => `${p.name} (${p.roles.join(', ')})`).join(', ')}
- Song List: ${songList.map((s: any, i: number) => `${i + 1}. ${s.singer} - ${s.key} ${s.artist}《${s.title}》`).join(', ')}

Create a visually appealing text poster with:
1. A catchy header with the studio name "Elevate Music Studio / 星月之音文化俱乐部"
2. Session theme (if provided) prominently displayed
3. Date, time and venue (809 French Rd, Kitchener Complex)
4. Participant lineup with their roles
5. Song list in order
6. A closing line inviting people

Use creative ASCII art borders, emojis, and formatting. Make it look like a real event poster that could be shared on social media. Keep it concise but eye-catching.`;

    console.log("Generating poster for session:", sessionName);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "user", content: prompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits needed. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const posterText = data.choices?.[0]?.message?.content || "Failed to generate poster";

    console.log("Poster generated successfully");

    return new Response(JSON.stringify({ poster: posterText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Poster generation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
