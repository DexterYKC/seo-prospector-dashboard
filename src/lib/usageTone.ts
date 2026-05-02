export type UsageTone = "good" | "warn" | "bad";

export function resolveUsageTone(used: number, limit: number): UsageTone {
  const u = Number(used || 0);
  const l = Number(limit || 0);
  if (!Number.isFinite(l) || l <= 0) return "bad";

  const left = Math.max(0, l - u);
  const goodThreshold = l >= 1500 ? 1500 : Math.ceil(l * 0.5);
  const warnThreshold = l >= 500 ? 500 : Math.ceil(l * 0.17);

  if (left >= goodThreshold) return "good";
  if (left > warnThreshold) return "warn";
  return "bad";
}

