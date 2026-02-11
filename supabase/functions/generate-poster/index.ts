import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Authentication check
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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { sessionName, theme, date, time, participants, songList } = await req.json();

    // Input validation
    if (!sessionName || typeof sessionName !== "string" || sessionName.length > 500) {
      return new Response(JSON.stringify({ error: "Invalid session name" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!Array.isArray(participants) || participants.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid participants" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!Array.isArray(songList) || songList.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid song list" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const W = 800;
    const participantLines = (participants as any[]).map(
      (p: any) => `${String(p.name || '').substring(0, 100)}  (${Array.isArray(p.roles) ? p.roles.join(', ') : ''})`
    );
    const songLines = (songList as any[]).map(
      (s: any, i: number) => `${i + 1}. ${String(s.singer || '').substring(0, 100)} -《${String(s.title || '').substring(0, 200)}》${String(s.artist || '').substring(0, 100)} [${String(s.key || '').substring(0, 20)}]`
    );

    // Calculate dynamic height
    const headerH = 200;
    const themeH = theme ? 80 : 0;
    const infoH = 100;
    const partHeaderH = 60;
    const partLinesH = participantLines.length * 32 + 20;
    const songHeaderH = 60;
    const songLinesH = songLines.length * 32 + 20;
    const footerH = 120;
    const H = headerH + themeH + infoH + partHeaderH + partLinesH + songHeaderH + songLinesH + footerH + 40;

    let y = 0;

    // Build SVG
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="50%" stop-color="#16213e"/>
      <stop offset="100%" stop-color="#0f3460"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e94560"/>
      <stop offset="100%" stop-color="#f5a623"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f5a623"/>
      <stop offset="100%" stop-color="#f7d794"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)" rx="20"/>
  <!-- Border -->
  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14" fill="none" stroke="url(#gold)" stroke-width="1.5" opacity="0.4"/>
  <!-- Decorative music notes -->
  <text x="60" y="60" font-size="30" opacity="0.15" fill="#f5a623">♪</text>
  <text x="${W - 80}" y="80" font-size="40" opacity="0.12" fill="#f5a623">♫</text>
  <text x="50" y="${H - 40}" font-size="35" opacity="0.1" fill="#f5a623">♬</text>
  <text x="${W - 60}" y="${H - 50}" font-size="28" opacity="0.13" fill="#f5a623">♩</text>
`;

    // Header
    y = 60;
    svg += `  <text x="${W / 2}" y="${y}" text-anchor="middle" font-size="16" fill="#f5a623" font-family="sans-serif" letter-spacing="4" opacity="0.8">✦ ✦ ✦</text>\n`;
    y += 40;
    svg += `  <text x="${W / 2}" y="${y}" text-anchor="middle" font-size="28" fill="#f7d794" font-family="sans-serif" font-weight="bold">${escapeXml("Elevate Music Studio")}</text>\n`;
    y += 36;
    svg += `  <text x="${W / 2}" y="${y}" text-anchor="middle" font-size="22" fill="#e8d5b7" font-family="sans-serif">${escapeXml("星月之音文化俱乐部")}</text>\n`;
    y += 30;
    // Divider line
    svg += `  <line x1="200" y1="${y}" x2="${W - 200}" y2="${y}" stroke="url(#accent)" stroke-width="2" opacity="0.6"/>\n`;
    y += 20;

    // Session name
    y += 10;
    svg += `  <text x="${W / 2}" y="${y}" text-anchor="middle" font-size="20" fill="#ffffff" font-family="sans-serif" font-weight="bold">${escapeXml(sessionName)}</text>\n`;
    y += 30;

    // Theme
    if (theme) {
      svg += `  <rect x="150" y="${y - 22}" width="${W - 300}" height="36" rx="18" fill="url(#accent)" opacity="0.2"/>\n`;
      svg += `  <text x="${W / 2}" y="${y + 2}" text-anchor="middle" font-size="18" fill="#e94560" font-family="sans-serif" font-weight="bold">🎨 ${escapeXml(String(theme).substring(0, 200))}</text>\n`;
      y += 50;
    }

    // Date / Time / Venue
    y += 10;
    svg += `  <text x="${W / 2}" y="${y}" text-anchor="middle" font-size="16" fill="#a8b2d1" font-family="sans-serif">📅 ${escapeXml(String(date || '').substring(0, 100))}</text>\n`;
    y += 28;
    svg += `  <text x="${W / 2}" y="${y}" text-anchor="middle" font-size="16" fill="#a8b2d1" font-family="sans-serif">⏰ ${escapeXml(String(time || '').substring(0, 50))}   📍 809 French Rd, Kitchener Complex</text>\n`;
    y += 36;

    // Divider
    svg += `  <line x1="100" y1="${y}" x2="${W - 100}" y2="${y}" stroke="#f5a623" stroke-width="0.5" opacity="0.3"/>\n`;
    y += 30;

    // Participants
    svg += `  <text x="${W / 2}" y="${y}" text-anchor="middle" font-size="18" fill="#f5a623" font-family="sans-serif" font-weight="bold">👥 Participants / 参与者 (${participants.length})</text>\n`;
    y += 30;
    for (const line of participantLines) {
      svg += `  <text x="${W / 2}" y="${y}" text-anchor="middle" font-size="14" fill="#ccd6f6" font-family="sans-serif">${escapeXml(line)}</text>\n`;
      y += 28;
    }
    y += 10;

    // Divider
    svg += `  <line x1="100" y1="${y}" x2="${W - 100}" y2="${y}" stroke="#f5a623" stroke-width="0.5" opacity="0.3"/>\n`;
    y += 30;

    // Songs
    svg += `  <text x="${W / 2}" y="${y}" text-anchor="middle" font-size="18" fill="#f5a623" font-family="sans-serif" font-weight="bold">🎶 Song List / 歌单</text>\n`;
    y += 30;
    for (const line of songLines) {
      svg += `  <text x="80" y="${y}" font-size="14" fill="#ccd6f6" font-family="sans-serif">${escapeXml(line)}</text>\n`;
      y += 28;
    }
    y += 20;

    // Divider
    svg += `  <line x1="200" y1="${y}" x2="${W - 200}" y2="${y}" stroke="url(#accent)" stroke-width="2" opacity="0.6"/>\n`;
    y += 30;

    // Footer
    svg += `  <text x="${W / 2}" y="${y}" text-anchor="middle" font-size="14" fill="#a8b2d1" font-family="sans-serif">🎵 Come jam with us! 欢迎参加！🎵</text>\n`;
    y += 30;
    svg += `  <text x="${W / 2}" y="${y}" text-anchor="middle" font-size="12" fill="#64748b" font-family="sans-serif" opacity="0.7">Elevate Music Studio © 2026</text>\n`;

    svg += `</svg>`;

    console.log("SVG poster generated for:", sessionName);

    return new Response(JSON.stringify({ svg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Poster generation error:", e);
    return new Response(JSON.stringify({ error: "Generation failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
