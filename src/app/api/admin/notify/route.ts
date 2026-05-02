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

async function requireAdminOrAgent(token: string): Promise<boolean> {
  // Check admin
  const meRes = await fetch(`${API_BASE}/v1/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (meRes.ok) {
    const data = await meRes.json();
    if (data?.user?.isAdmin === true) return true;
  }
  // Check support agent (agents hit their own endpoint)
  const agRes = await fetch(`${API_BASE}/v1/support-agent/tickets?limit=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return agRes.ok;
}

// POST /api/admin/notify
// Body: { userId: string | "all", title: string, message?: string, type?: string, category?: string }
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const allowed = await requireAdminOrAgent(token);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { userId, title, message, type = "info", category = "admin" } = body as {
    userId: string;
    title: string;
    message?: string;
    type?: string;
    category?: string;
  };

  if (!userId || !title) {
    return NextResponse.json({ error: "Missing userId or title" }, { status: 400 });
  }

  // "all" → notify every user (admin only)
  if (userId === "all") {
    const meRes = await fetch(`${API_BASE}/v1/me`, { headers: { Authorization: `Bearer ${token}` } });
    const meData = await meRes.json();
    if (!meData?.user?.isAdmin) {
      return NextResponse.json({ error: "Only admins can broadcast" }, { status: 403 });
    }

    const allIds: string[] = [];
    let page = 1;
    while (true) {
      const r = await fetch(`${API_BASE}/v1/admin/users?page=${page}&limit=500`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) break;
      const d = await r.json();
      const users: { id: string | number }[] = d.users ?? [];
      if (users.length === 0) break;
      allIds.push(...users.map(u => String(u.id)));
      if (users.length < 500) break;
      page++;
    }

    if (allIds.length > 0) {
      await sbFetch("/notifications", {
        method: "POST",
        body: JSON.stringify(
          allIds.map(uid => ({
            user_id: uid,
            title,
            message: message ?? null,
            type,
            category,
          }))
        ),
      });
    }
    return NextResponse.json({ ok: true, sent: allIds.length });
  }

  // Single user
  await sbFetch("/notifications", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, title, message: message ?? null, type, category }),
  });

  return NextResponse.json({ ok: true });
}
