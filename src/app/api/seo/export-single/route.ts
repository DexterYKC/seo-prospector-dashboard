import { NextRequest, NextResponse } from "next/server";

const API_BASE    = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com";
const EXT_API_KEY = process.env.BACKEND_EXT_API_KEY || "";

const extHeaders = (token: string) => ({
  "Content-Type": "application/json",
  "x-ext-key": EXT_API_KEY,
  "x-user-token": token,
});

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 }); }

  // 1. Consume quota first — mirrors extension's consumeSeoExportQuota() order
  const consumeRes = await fetch(`${API_BASE}/v1/usage/consume`, {
    method: "POST",
    headers: extHeaders(token),
    body: JSON.stringify({ metric: "seo_exports", amount: 1 }),
  });
  const consumeData = await consumeRes.json() as { ok?: boolean; error?: string; limitReached?: boolean };

  if (!consumeData.ok) {
    if (consumeData.limitReached || consumeRes.status === 429) {
      return NextResponse.json({ ok: false, error: "SEO_EXPORT_QUOTA_REACHED" }, { status: 429 });
    }
    if (consumeRes.status === 403) {
      return NextResponse.json({ ok: false, error: "FEATURE_DISABLED_EXPORT_CSV" }, { status: 403 });
    }
    // Non-blocking quota failures (backend key missing etc.) — still allow export
    if (consumeData.error !== "UNAUTHORIZED") {
      // bypass and continue
    } else {
      return NextResponse.json({ ok: false, error: consumeData.error }, { status: consumeRes.status });
    }
  }

  // 2. Run the actual export
  const res = await fetch(`${API_BASE}/v1/seo/export-single`, {
    method: "POST",
    headers: extHeaders(token),
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
