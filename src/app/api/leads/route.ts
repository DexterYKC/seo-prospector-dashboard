import { NextRequest, NextResponse } from "next/server";

const API_BASE    = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com";
const EXT_API_KEY = process.env.BACKEND_EXT_API_KEY || "";

const extHeaders = (token: string) => ({
  "Content-Type": "application/json",
  "x-ext-key": EXT_API_KEY,
  "x-user-token": token,
});

export async function DELETE(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 }); }

  const res = await fetch(`${API_BASE}/v1/leads`, {
    method: "DELETE",
    headers: extHeaders(token),
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
