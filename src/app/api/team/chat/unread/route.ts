import { NextRequest, NextResponse } from "next/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com";
const SB_URL   = process.env.SUPABASE_URL!;
const SB_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
  const res = await fetch(
    `${SB_URL}/rest/v1/team_members?member_user_id=eq.${userId}&select=owner_user_id&limit=1`,
    { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
  );
  const rows = await res.json();
  return rows?.[0]?.owner_user_id ?? null;
}

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ count: 0 }, { headers: CORS });

  const user = await resolveUser(token);
  if (!user) return NextResponse.json({ count: 0 }, { headers: CORS });

  const teamId = await resolveTeamId(user.id, user.teamRole);
  if (!teamId) return NextResponse.json({ count: 0 }, { headers: CORS });

  // Count messages not yet read by this user and not sent by them
  const res = await fetch(
    `${SB_URL}/rest/v1/team_messages?team_id=eq.${teamId}&recipient_id=is.null&read_by=not.cs.{"${user.id}"}&sender_id=neq.${user.id}&select=id`,
    {
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        Prefer: "count=exact",
        "Range-Unit": "items",
        Range: "0-0",
      },
    }
  );

  const contentRange = res.headers.get("content-range");
  const count = contentRange ? parseInt(contentRange.split("/")[1] || "0", 10) : 0;
  return NextResponse.json({ ok: true, count: isNaN(count) ? 0 : count }, { headers: CORS });
}
