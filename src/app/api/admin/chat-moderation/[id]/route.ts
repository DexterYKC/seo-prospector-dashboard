import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com";
const SB_URL   = process.env.SUPABASE_URL!;
const SB_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function requireAdmin(token: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/v1/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data?.user?.isAdmin === true;
}

// PATCH /api/admin/chat-moderation/[id] — mark reviewed
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token || !(await requireAdmin(token))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const res = await fetch(`${SB_URL}/rest/v1/chat_moderation_reports?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ reviewed: true }),
  });

  if (!res.ok) return NextResponse.json({ error: "Failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
