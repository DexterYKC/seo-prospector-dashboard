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

// GET /api/admin/chat-logs/[teamId] — download full team chat log as CSV
export async function GET(req: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token || !(await requireAdmin(token))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { teamId } = await params;
  const res = await fetch(
    `${SB_URL}/rest/v1/team_messages?team_id=eq.${teamId}&recipient_id=is.null&order=created_at.asc&limit=1000`,
    { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
  );

  if (!res.ok) return NextResponse.json({ error: "Failed" }, { status: 500 });
  const messages = await res.json();

  const escape = (s: string) => `"${String(s ?? "").replace(/"/g, '""')}"`;
  const rows = [
    ["id", "sender_id", "content", "created_at"].join(","),
    ...((Array.isArray(messages) ? messages : []).map((m: Record<string, unknown>) =>
      [escape(m.id as string), escape(m.sender_id as string), escape(m.content as string), escape(m.created_at as string)].join(",")
    )),
  ];

  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="chat-log-${teamId}.csv"`,
    },
  });
}
