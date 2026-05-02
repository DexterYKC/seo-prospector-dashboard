"use client";

import { useEffect, useRef, useState } from "react";
import type { LeadRecord, MessageLog } from "@/lib/api";
import { generateMessage, logMessageGeneration, logMessageSent } from "@/lib/api";
import { useLang } from "@/contexts/LangContext";
import { tr } from "@/lib/i18n";

function getLeadName(lead: LeadRecord) {
  const n = String(lead.name || "").trim();
  if (n) return n;
  return `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "Unknown";
}

function getLeadCompany(lead: LeadRecord) {
  const opp = lead.opportunities?.[0];
  return String(opp?.company || lead.company || "");
}

function getLeadType(lead: LeadRecord): "HOT" | "WARM" | "COLD" {
  const opps = Array.isArray(lead.opportunities) ? lead.opportunities : [];
  for (const opp of opps) {
    if (String(opp.leadType || "").toUpperCase().includes("HOT")) return "HOT";
  }
  for (const opp of opps) {
    if (String(opp.leadType || "").toUpperCase().includes("WARM")) return "WARM";
  }
  const raw = String(lead.leadType || lead.decision?.leadType || "").toUpperCase();
  if (raw.includes("HOT")) return "HOT";
  if (raw.includes("WARM")) return "WARM";
  return "COLD";
}

function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0] || "?").slice(0, 2).toUpperCase();
}

type Props = {
  lead: LeadRecord | null;
  log: MessageLog | null;
  token: string;
  onClose: () => void;
  onLogUpdated?: () => void;
};

const TONES = [
  { value: "professional", labelEn: "Professional", labelFr: "Professionnel" },
  { value: "friendly",     labelEn: "Friendly",     labelFr: "Amical" },
  { value: "direct",       labelEn: "Direct",       labelFr: "Direct" },
  { value: "consultative", labelEn: "Consultative", labelFr: "Consultatif" },
];

function getRecommendedTone(lead: LeadRecord): string {
  const lt  = getLeadType(lead);
  const opp = lead.opportunities?.[0];
  const raw = String(opp?.seoLevel || "").toUpperCase();
  const seo = ["CRITICAL", "SITE_UNREACHABLE"].includes(raw) ? "CRITICAL"
            : raw === "WEAK" ? "WEAK" : "OK";

  if (lt === "HOT")  return seo === "CRITICAL" ? "consultative" : "friendly";
  if (lt === "WARM") return seo === "CRITICAL" ? "direct" : seo === "WEAK" ? "consultative" : "friendly";
  /* COLD */         return seo === "CRITICAL" ? "direct" : "professional";
}

export function MessageDrawer({ lead, log, token, onClose, onLogUpdated }: Props) {
  const { lang } = useLang();
  const T = (en: string, fr: string) => tr(lang, en, fr);

  const [closing,    setClosing]    = useState(false);
  const [message,    setMessage]    = useState(log?.message_preview ?? "");
  const [context,    setContext]    = useState("");
  const [tone,       setTone]       = useState("professional");
  const [generating, setGenerating] = useState(false);
  const [sending,    setSending]    = useState(false);
  const [genError,   setGenError]   = useState("");
  const [copied,     setCopied]     = useState(false);
  const [imgFailed,  setImgFailed]  = useState(false);

  const initialMsg = useRef(message);

  // Reset when lead changes — auto-apply recommended tone
  useEffect(() => {
    const preview = log?.message_preview ?? "";
    setMessage(preview);
    initialMsg.current = preview;
    setContext("");
    setTone("professional");
    setGenError("");
    setCopied(false);
    setImgFailed(false);
  }, [lead?.profileUrl, log]);

  function handleClose() {
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); }, 220);
  }

  if (!lead) return null;

  const name     = getLeadName(lead);
  const company  = getLeadCompany(lead);
  const lt       = getLeadType(lead);
  const initials = getInitials(name);
  const ltColor  = lt === "HOT" ? "#ef4444" : lt === "WARM" ? "#f59e0b" : "#10b981";
  const ltBg     = lt === "HOT" ? "rgba(239,68,68,0.1)" : lt === "WARM" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)";

  const opp = lead.opportunities?.[0];
  const oppName = opp?.company || company;

  async function handleGenerate() {
    if (!lead) return;
    setGenerating(true);
    setGenError("");
    try {
      const res = await generateMessage(token, {
        lead,
        leadId: lead.id,
        opportunityId: opp?.id,
        messageType: tone,
        language: lang,
        context: context.trim() || undefined,
      });
      if (res.ok && res.message) {
        setMessage(res.message);
        initialMsg.current = res.message;
        // Log generation with preview
        void logMessageGeneration(token, {
          profileUrl: lead.profileUrl || "",
          leadName: name,
          opportunityName: oppName,
          messagePreview: res.message.slice(0, 500),
        });
        onLogUpdated?.();
      } else {
        setGenError(T("Generation failed, please retry.", "Génération échouée, réessayez."));
      }
    } catch {
      setGenError(T("Network error, please retry.", "Erreur réseau, réessayez."));
    } finally {
      setGenerating(false);
    }
  }

  async function handleSend() {
    if (!lead || !message.trim()) return;
    setSending(true);
    try {
      const wasEdited = message !== initialMsg.current;
      // Copy to clipboard
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      // Open LinkedIn profile
      if (lead.profileUrl) window.open(lead.profileUrl, "_blank", "noreferrer");
      // Log sent
      await logMessageSent(token, {
        profileUrl: lead.profileUrl || "",
        leadName: name,
        messagePreview: message.slice(0, 500),
        wasEdited,
        sentStatus: "SENT",
      });
      onLogUpdated?.();
    } catch {
      /* copy may fail if not https, silent */
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className={`drawerOverlay${closing ? " closing" : ""}`} onClick={handleClose} />
      <aside className={`drawer${closing ? " closing" : ""}`} style={{ width: 480 }}>

        {/* Header */}
        <div className="drawerHeader">
          {lead.avatarUrl && !imgFailed ? (
            <img
              src={lead.avatarUrl}
              alt={name}
              className="drawerAvatar"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="drawerAvatar" style={{ background: ltBg, color: ltColor, fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {initials}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="drawerName" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 20, background: ltBg, color: ltColor, flexShrink: 0 }}>{lt}</span>
            </div>
            {company && <div className="drawerCompany">{company}</div>}
          </div>
          {lead.profileUrl && (
            <a href={lead.profileUrl} target="_blank" rel="noreferrer" style={{ color: "var(--muted)", display: "flex", padding: 4 }} title="LinkedIn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          )}
          <button className="drawerClose" onClick={handleClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="drawerBody" style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Activity log */}
          {log && (
            <div style={{
              marginTop: 16,
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "var(--surface-soft)",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {T("Activity", "Activité")}
              </div>

              {/* Badges row */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {/* Generation count */}
                {(log.generation_count ?? 0) > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                    background: "rgba(37,99,235,0.08)", color: "var(--accent)",
                    border: "1px solid rgba(37,99,235,0.15)",
                  }}>
                    {log.generation_count} {log.generation_count === 1 ? T("generation", "génération") : T("generations", "générations")}
                  </span>
                )}

                {/* Sent status */}
                {log.sent_status === "SENT" ? (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                    background: "rgba(16,185,129,0.08)", color: "#10b981",
                    border: "1px solid rgba(16,185,129,0.2)",
                  }}>
                    {T("Sent", "Envoyé")}
                    {log.sent_at ? ` · ${new Date(log.sent_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""}
                  </span>
                ) : (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                    background: "rgba(245,158,11,0.08)", color: "#f59e0b",
                    border: "1px solid rgba(245,158,11,0.2)",
                  }}>
                    {T("Not sent yet", "Pas encore envoyé")}
                  </span>
                )}

                {/* Manually edited */}
                {log.was_manually_edited && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                    background: "rgba(124,58,237,0.08)", color: "#7c3aed",
                    border: "1px solid rgba(124,58,237,0.18)",
                  }}>
                    {T("Edited", "Modifié")}
                  </span>
                )}
              </div>

              {/* Message preview */}
              {log.message_preview && (
                <div style={{
                  fontSize: 12, color: "var(--text)", lineHeight: 1.55,
                  borderLeft: "3px solid var(--accent)", paddingLeft: 10,
                  opacity: 0.75,
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                }}>
                  {log.message_preview.length > 300 ? log.message_preview.slice(0, 300) + "…" : log.message_preview}
                </div>
              )}
            </div>
          )}

          {/* Tone */}
          {(() => {
            const recommended = getRecommendedTone(lead);
            return (
              <div style={{ paddingTop: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  {T("Tone", "Ton")}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {TONES.map(t => {
                    const isActive      = tone === t.value;
                    const isRecommended = t.value === recommended;
                    return (
                      <button
                        key={t.value}
                        onClick={() => setTone(t.value)}
                        style={{
                          padding: "5px 13px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.12s",
                          border:      isActive ? "1.5px solid #6366f1" : "1.5px solid var(--line)",
                          background:  isActive ? "rgba(99,102,241,0.09)" : "transparent",
                          color:       isActive ? "#6366f1" : "var(--muted)",
                        }}
                      >
                        {lang === "fr" ? t.labelFr : t.labelEn}
                        {isRecommended && (
                          <span style={{ fontSize: 8, marginLeft: 4, verticalAlign: "middle", color: "#f97316", opacity: 0.9 }}>★</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Context / prompt */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              {T("Context (optional)", "Contexte (optionnel)")}
            </div>
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder={T("e.g. focus on SEO issues, keep it under 300 chars…", "ex. focus sur les problèmes SEO, moins de 300 caractères…")}
              rows={2}
              style={{
                width: "100%", resize: "vertical", padding: "10px 12px", borderRadius: 10,
                border: "1px solid var(--line)", background: "var(--surface-soft)",
                color: "var(--text)", fontSize: 13, fontFamily: "var(--font)",
                lineHeight: 1.5, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "11px 20px", borderRadius: 12, fontWeight: 700, fontSize: 13,
              cursor: generating ? "not-allowed" : "pointer", opacity: generating ? 0.7 : 1,
              border: "none", background: "linear-gradient(135deg, #3b82f6, #2159da)",
              color: "#fff", transition: "opacity 0.15s",
            }}
          >
            {generating ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-9-9"/></svg>
                {T("Generating…", "Génération…")}
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                {T("Generate message", "Générer le message")}
              </>
            )}
          </button>

          {genError && <div style={{ fontSize: 12, color: "#ef4444", marginTop: -10 }}>{genError}</div>}

          {/* Message textarea */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>{T("Message", "Message")}</span>
              {message && <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>{message.length} {T("chars", "car.")}</span>}
            </div>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={T("Generate a message above, or write your own…", "Générez un message ci-dessus, ou écrivez le vôtre…")}
              rows={8}
              style={{
                width: "100%", resize: "vertical", padding: "12px 14px", borderRadius: 10,
                border: "1px solid var(--line)", background: "var(--surface-soft)",
                color: "var(--text)", fontSize: 13, fontFamily: "var(--font)",
                lineHeight: 1.6, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "11px 20px", borderRadius: 12, fontWeight: 700, fontSize: 13,
              cursor: (!message.trim() || sending) ? "not-allowed" : "pointer",
              opacity: (!message.trim() || sending) ? 0.6 : 1,
              border: "none", background: copied ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#7c3aed,#5b21b6)",
              color: "#fff", transition: "background 0.25s, opacity 0.15s",
              marginBottom: 24,
            }}
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {T("Copied! LinkedIn opened.", "Copié ! LinkedIn ouvert.")}
              </>
            ) : sending ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-9-9"/></svg>
                {T("Sending…", "Envoi…")}
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                {T("Copy & open LinkedIn", "Copier & ouvrir LinkedIn")}
              </>
            )}
          </button>

        </div>
      </aside>
    </>
  );
}
