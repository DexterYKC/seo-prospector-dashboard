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

async function resolveUserId(token: string): Promise<string | null> {
  const res = await fetch(`${API_BASE}/v1/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.user?.id ? String(data.user.id) : null;
}

// GET /api/notifications — fetch current user's notifications (last 30)
export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = await resolveUserId(token);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await sbFetch(
    `/notifications?user_id=eq.${userId}&order=created_at.desc&limit=30`
  );
  const notifs = await res.json();
  return NextResponse.json({
    ok: true,
    notifications: Array.isArray(notifs) ? notifs : [],
  });
}

// POST /api/notifications — mark all as read
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = await resolveUserId(token);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await sbFetch(`/notifications?user_id=eq.${userId}&read=eq.false`, {
    method: "PATCH",
    body: JSON.stringify({ read: true }),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
