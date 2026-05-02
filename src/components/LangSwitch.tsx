"use client";

import { useLang } from "@/contexts/LangContext";

export function LangSwitch({ style }: { style?: React.CSSProperties }) {
  const { lang, setLang } = useLang();

  const btnStyle = (active: boolean): React.CSSProperties => ({
    height: 28, padding: "0 10px", borderRadius: 20,
    border: "none",
    background: active ? "#64748b" : "transparent",
    color: active ? "#fff" : "var(--muted, #94a3b8)",
    fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.04em",
    display: "flex", alignItems: "center", transition: "all 0.15s",
    flexShrink: 0,
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, ...style }}>
      <button onClick={() => setLang("en")} style={btnStyle(lang === "en")}>EN</button>
      <span style={{ fontSize: 10, color: "var(--muted, #94a3b8)" }}>|</span>
      <button onClick={() => setLang("fr")} style={btnStyle(lang === "fr")}>FR</button>
    </div>
  );
}

/** Variant for dark headers (moderator, support-agent) */
export function LangSwitchDark({ style }: { style?: React.CSSProperties }) {
  const { lang, setLang } = useLang();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, ...style }}>
      <button
        onClick={() => setLang("en")}
        style={{
          fontSize: 11, fontWeight: 700, padding: "3px 7px", borderRadius: 4,
          border: "none", cursor: "pointer",
          background: lang === "en" ? "rgba(255,255,255,0.2)" : "transparent",
          color: lang === "en" ? "#fff" : "rgba(255,255,255,0.5)",
        }}
      >EN</button>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>|</span>
      <button
        onClick={() => setLang("fr")}
        style={{
          fontSize: 11, fontWeight: 700, padding: "3px 7px", borderRadius: 4,
          border: "none", cursor: "pointer",
          background: lang === "fr" ? "rgba(255,255,255,0.2)" : "transparent",
          color: lang === "fr" ? "#fff" : "rgba(255,255,255,0.5)",
        }}
      >FR</button>
    </div>
  );
}
