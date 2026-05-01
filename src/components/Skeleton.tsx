"use client";

export function Skeleton({
  width,
  height,
  rounded,
  style,
}: {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="skeleton"
      style={{
        width: width ?? "100%",
        height: height ?? 16,
        borderRadius: rounded ? 999 : "var(--radius)",
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <article className="card" style={{ padding: "20px 22px" }}>
      <Skeleton width="40%" height={14} style={{ marginBottom: 18 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={12} style={{ marginBottom: 10, width: i % 2 === 0 ? "100%" : "75%" }} />
      ))}
    </article>
  );
}
