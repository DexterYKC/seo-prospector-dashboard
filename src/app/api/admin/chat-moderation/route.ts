import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com";
const SB_URL   = process.env.SUPABASE_URL!;
const SB_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function sb(path: string) {
  return fetch(`${SB_URL}/rest/v1${path}`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
  });
}

async function requireAdmin(token: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/v1/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data?.user?.isAdmin === true;
}

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token || !(await requireAdmin(token))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const onlyUnreviewed = req.nextUrl.searchParams.get("unreviewed") === "1";
  let url = `/chat_moderation_reports?order=created_at.desc&limit=200`;
  if (onlyUnreviewed) url += `&reviewed=eq.false`;

  const res = await sb(url);
  const flags = await res.json();
  return NextResponse.json({ ok: true, flags: Array.isArray(flags) ? flags : [] });
}
