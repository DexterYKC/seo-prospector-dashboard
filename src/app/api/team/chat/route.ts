import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com";
const SB_URL   = process.env.SUPABASE_URL!;
const SB_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function sbFetch(path: string, init?: RequestInit) {
  return fetch(`${SB_URL}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
}

async function resolveUser(token: string): Promise<{ id: string; teamRole: string | null } | null> {
  const res = await fetch(`${API_BASE}/v1/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.user ? { id: String(data.user.id), teamRole: data.user.teamRole ?? null } : null;
}

async function resolveTeamId(userId: string, teamRole: string | null): Promise<string | null> {
  if (!teamRole || teamRole === "OWNER") return userId;
  const res = await sbFetch(
    `/team_members?member_user_id=eq.${userId}&select=owner_user_id&limit=1`
  );
  const rows = await res.json();
  return rows?.[0]?.owner_user_id ?? null;
}

// ---- Content moderation ----
const MODERATION_RULES: { category: string; reason: string; patterns: RegExp[] }[] = [
  {
    category: "scam",
    reason: "Potential financial scam",
    patterns: [
      /\bscam(mer|ming)?\b/i,
      /wire.?transfer/i, /western.?union/i, /moneygram/i,
      /gift.?card.*(code|pin|number)/i, /itunes.*(card|code)/i,
      /advance.?fee/i, /lottery.*(won|winner)/i,
      /inheritance.*(million|fund)/i, /double.?your.?money/i,
      /send.*money.*urgent/i, /urgent.*payment/i,
      /arnaque/i, /escroquerie/i,
    ],
  },
  {
    category: "fraud",
    reason: "Potential fraud / phishing",
    patterns: [
      /cvv.*(code|number)/i, /stolen.*(card|account)/i,
      /fake.?invoice/i, /money.?laundering/i, /blanchiment/i,
      /card.*(number|expir).*(send|share|give)/i,
      /bank.?credential/i, /(send|share|give).*password/i,
      /dark.?web/i,
      /(sell|vendre|revendre).*(data|données|info|credential|compte|password|mdp)/i,
      /(data|données|info|credential|compte).*(sell|vendre|revendre)/i,
      /informations?.*(ill[eé]gales?|vol[eé]es?|stolen)/i,
      /doxx(ing)?\b/i,
      /phishing/i, /hameçonnage/i,
      /usurp.*(identit)/i,
    ],
  },
  {
    category: "violence",
    reason: "Potential threat or violence",
    patterns: [
      /i.{0,5}(will|gonna|'ll).{0,15}(kill|murder|shoot|stab|hurt)/i,
      /je.{0,5}(vais|veux).{0,20}(tuer|butter|buter|frapper|massacrer)/i,
      /bomb.?threat/i, /you.{0,5}(are|'re).{0,5}dead/i,
      /i.?know.?where.?you.?live/i, /watch.?your.?back/i,
      /menace.*(mort|violence)/i,
    ],
  },
  {
    category: "illegal",
    reason: "Potential illegal activity",
    patterns: [
      /\b(cocaine|heroin|methamphetamine|fentanyl|drogue)\b.*\b(buy|sell|trade|ship|vendre|acheter)\b/i,
      /\b(buy|sell|trade|ship|vendre|acheter)\b.*\b(cocaine|heroin|methamphetamine|fentanyl|drogue)\b/i,
      /fake.*(passport|visa|diploma|id card)/i,
      /faux.*(passeport|visa|diplôme|carte d.identit)/i,
      /human.?traffic(k?ing)?/i, /trafic.*(humain|êtres)/i,
      /child.?exploit/i,
      /marché.?noir/i, /black.?market/i,
    ],
  },
];

function moderateContent(content: string): { category: string; reason: string } | null {
  for (const rule of MODERATION_RULES) {
    if (rule.patterns.some(p => p.test(content))) {
      return { category: rule.category, reason: rule.reason };
    }
  }
  return null;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

// GET /api/team/chat — fetch group messages
export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS });

  const user = await resolveUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS });

  const teamId = await resolveTeamId(user.id, user.teamRole);
  if (!teamId) return NextResponse.json({ error: "No team found" }, { status: 404, headers: CORS });

  const before = req.nextUrl.searchParams.get("before");
  let url = `/team_messages?team_id=eq.${teamId}&recipient_id=is.null&order=created_at.asc&limit=80`;
  if (before) url += `&created_at=lt.${encodeURIComponent(before)}`;

  const [msgRes] = await Promise.all([
    sbFetch(url),
    // mark as read silently
    sbFetch("/rpc/mark_team_messages_read", {
      method: "POST",
      body: JSON.stringify({ p_team_id: teamId, p_user_id: user.id }),
    }),
  ]);

  const messages = await msgRes.json();
  return NextResponse.json({
    ok: true,
    messages: Array.isArray(messages) ? messages : [],
    teamId,
    userId: user.id,
  }, { headers: CORS });
}

// POST /api/team/chat — send a message
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS });

  const user = await resolveUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS });

  const teamId = await resolveTeamId(user.id, user.teamRole);
  if (!teamId) return NextResponse.json({ error: "No team found" }, { status: 404, headers: CORS });

  const body = await req.json().catch(() => ({}));
  const content = String(body.content || "").trim();
  if (!content) return NextResponse.json({ error: "Empty message" }, { status: 400, headers: CORS });

  const res = await sbFetch("/team_messages", {
    method: "POST",
    body: JSON.stringify({
      team_id: teamId,
      sender_id: user.id,
      recipient_id: null,
      content,
      read_by: [user.id],
    }),
  });

  if (!res.ok) return NextResponse.json({ error: "Failed to send" }, { status: 500, headers: CORS });
  const [message] = await res.json();

  // Silent moderation scan — fire and forget
  const flag = moderateContent(content);
  if (flag) {
    sbFetch("/chat_moderation_reports", {
      method: "POST",
      body: JSON.stringify({
        message_id: message?.id ?? "unknown",
        team_id: teamId,
        sender_id: user.id,
        content,
        flag_reason: flag.reason,
        flag_category: flag.category,
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, message }, { headers: CORS });
}
