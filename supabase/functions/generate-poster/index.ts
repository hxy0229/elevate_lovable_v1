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

    const participantList = participants.map((p: any) => `${p.name} (${p.roles.join(', ')})`).join('\n');
    const songListText = songList.map((s: any, i: number) => `${i + 1}. ${s.singer} - ${s.title} by ${s.artist} [Key: ${s.key}]`).join('\n');

    const prompt = `Generate a beautiful, aesthetic event poster image for a music jam session. The poster should look professional and visually stunning, suitable for sharing on social media.

Design requirements:
- Modern, elegant design with a musical/artistic theme
- Use warm, inviting colors (golds, deep blues, warm oranges)
- Include decorative musical elements (notes, instruments silhouettes)
- Clean typography with clear hierarchy
- The text should be readable and well-laid-out

Content to include on the poster:
🎵 Studio: Elevate Music Studio / 星月之音文化俱乐部
📋 Session: ${sessionName}
${theme ? `🎨 Theme: ${theme}` : ''}
📅 Date: ${date}
⏰ Time: ${time}
📍 Venue: 809 French Rd, Kitchener Complex

👥 Performers (${participants.length}):
${participantList}

🎶 Song List:
${songListText}

Make the poster portrait orientation (3:4 ratio). Use elegant fonts and layout. The overall feel should be warm, professional, and music-themed.`;

    console.log("Generating image poster for session:", sessionName);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          { role: "user", content: prompt },
        ],
        modalities: ["image", "text"],
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
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data).substring(0, 500));
      return new Response(JSON.stringify({ error: "Failed to generate poster image" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Image poster generated successfully");

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Poster generation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
