"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { useSession } from "@/contexts/SessionContext";
import { useUserData } from "@/contexts/UserContext";
import { fetchMyTickets, createTicket, supportChat, type SupportTicket } from "@/lib/api";
import { useLang } from "@/contexts/LangContext";
import { tr } from "@/lib/i18n";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string };
type SupportTab = "chat" | "tickets";

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

function BotAvatar() {
  return (
    <div className="supportBotAvatar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
        <path d="M5 14v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"/>
        <circle cx="9" cy="17" r="1"/><circle cx="15" cy="17" r="1"/>
      </svg>
    </div>
  );
}

export default function SupportPage() {
  const { token }        = useSession();
  const { data }         = useUserData();
  const router           = useRouter();
  const searchParams     = useSearchParams();
  const { lang }         = useLang();
  const T = (en: string, fr: string) => tr(lang, en, fr);
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  const user      = data?.user      || {};
  const usage     = data?.usage     || {};
  const limits    = data?.limits    || {};
  const remaining = data?.remaining || {};

  const STATUS_LABEL: Record<string, string> = {
    open:        T("Open",        "Ouvert"),
    in_progress: T("In progress", "En cours"),
    closed:      T("Closed",      "Fermé"),
  };
  const STATUS_CLASS: Record<string, string> = {
    open: "ticketBadge--open", in_progress: "ticketBadge--progress", closed: "ticketBadge--closed",
  };

  const initialTab = (searchParams.get("tab") as SupportTab) || "chat";
  const [supportTab, setSupportTab] = useState<SupportTab>(initialTab);

  // ── Chat state ──
  const welcomeMsg: ChatMessage = {
    id: "welcome",
    role: "assistant",
    content: T(
      "Hi! I'm your seoprospector assistant. How can I help you today? I can answer questions about the extension, quotas, billing, LinkedIn prospecting, and more.",
      "Bonjour ! Je suis votre assistant seoprospector. Comment puis-je vous aider ? Je peux répondre à vos questions sur l'extension, les quotas, la facturation, la prospection LinkedIn et plus encore."
    ),
  };
  const [messages,  setMessages]  = useState<ChatMessage[]>([welcomeMsg]);
  const [input,     setInput]     = useState("");
  const [thinking,  setThinking]  = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Tickets state ──
  const [tickets,    setTickets]    = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [subject,    setSubject]    = useState("");
  const [ticketMsg,  setTicketMsg]  = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ticketError, setTicketError] = useState("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const loadTickets = useCallback(async () => {
    if (!token) return;
    setTicketsLoading(true);
    try {
      const res = await fetchMyTickets(token);
      setTickets(res.tickets || []);
    } catch { /* silent */ }
    finally { setTicketsLoading(false); }
  }, [token]);

  useEffect(() => {
    if (supportTab === "tickets") void loadTickets();
  }, [supportTab, loadTickets]);

  async function onSendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || thinking || !token) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setThinking(true);

    try {
      const history = next.filter(m => m.id !== "welcome").map(m => ({ role: m.role, content: m.content }));
      const ctx = {
        email:     String(user.email   || ""),
        plan:      String(user.plan    || "FREE").toUpperCase(),
        status:    String(user.status  || "ACTIVE").toUpperCase(),
        usage:     { scans: Number(usage.profiles_scanned  || 0), seo: Number(usage.seo_exports       || 0), messages: Number(usage.messages_generated || 0) },
        limits:    { scans: Number(limits.profiles_scanned || 0), seo: Number(limits.seo_exports      || 0), messages: Number(limits.messages_generated || 0) },
        remaining: { scans: Number(remaining.profiles_scanned || 0), seo: Number(remaining.seo_exports || 0), messages: Number(remaining.messages_generated || 0) },
        nextReset: String(user.nextResetAt || user.quota_reset_at || ""),
      };
      const res = await supportChat(token, history, ctx);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: res.answer }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: T(
          "Sorry, I'm having trouble connecting right now. Please try again or create a support ticket.",
          "Désolé, je rencontre un problème de connexion. Réessayez ou créez un ticket de support."
        ),
      }]);
    } finally {
      setThinking(false);
    }
  }

  async function onCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !subject.trim() || !ticketMsg.trim()) return;
    setSubmitting(true);
    setTicketError("");
    try {
      const res = await createTicket(token, { subject: subject.trim(), message: ticketMsg.trim() });
      setShowTicketForm(false);
      setSubject("");
      setTicketMsg("");
      router.push(`/support/${res.ticket.id}`);
    } catch { setTicketError(T("Failed to create ticket.", "Impossible de créer le ticket.")); }
    finally { setSubmitting(false); }
  }

  return (
    <AppLayout>
      <div className="pageHeader">
        <div className="pageTitleGroup">
          <div className="pageTitleIconBox">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
          </div>
          <div>
            <h1 className="pageTitle">Support</h1>
            <p className="pageSubtitle">{T("AI assistant · human escalation if needed", "Assistant IA · escalade humaine si besoin")}</p>
          </div>
        </div>
      </div>

      <div className="pageContent supportPage">

        {/* Tabs + New ticket button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="supportTabs">
            <button className={`supportTabBtn${supportTab === "chat" ? " active" : ""}`} onClick={() => setSupportTab("chat")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {T("Ask AI", "Demander à l'IA")}
            </button>
            <button className={`supportTabBtn${supportTab === "tickets" ? " active" : ""}`} onClick={() => setSupportTab("tickets")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              {T("My tickets", "Mes tickets")}
              {tickets.length > 0 && <span className="supportTabCount">{tickets.length}</span>}
            </button>
          </div>
          <button className="supportNewTicketBtn" onClick={() => { setShowTicketForm(true); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {T("New ticket", "Nouveau ticket")}
          </button>
        </div>

        {/* ── CHAT TAB ── */}
        {supportTab === "chat" && (
          <div className="supportChatWrap">
            <div className="supportChatMessages">
              {messages.map(msg => (
                <div key={msg.id} className={`supportMsg supportMsg--${msg.role}`}>
                  {msg.role === "assistant" && <BotAvatar />}
                  <div className="supportMsgBubble">
                    {msg.content.split("\n").map((line, i) => (
                      <span key={i}>{line}{i < msg.content.split("\n").length - 1 && <br />}</span>
                    ))}
                  </div>
                </div>
              ))}

              {thinking && (
                <div className="supportMsg supportMsg--assistant">
                  <BotAvatar />
                  <div className="supportMsgBubble supportMsgBubble--typing">
                    <span/><span/><span/>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input + escalade intégrée */}
            <form className="supportChatForm" onSubmit={(e) => void onSendMessage(e)}>
              <div className="supportEscalate">
                <span className="supportEscalateText">{T("Need human support?", "Besoin d'un support humain ?")}</span>
                <button type="button" className="supportEscalateBtn" onClick={() => setShowTicketForm(true)}>
                  {T("Create a ticket", "Créer un ticket")}
                </button>
              </div>
              <div className="supportChatInputRow">
                <input
                  className="supportChatInput"
                  placeholder={T("Ask a question…", "Posez une question…")}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={thinking}
                  autoFocus
                />
                <button className="supportChatSend" type="submit" disabled={!input.trim() || thinking}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </form>

          </div>
        )}

        {/* ── TICKETS TAB ── */}
        {supportTab === "tickets" && (
          <div className="supportTicketsWrap">
            {ticketsLoading ? (
              <div className="supportTicketsEmpty">{T("Loading…", "Chargement…")}</div>
            ) : tickets.length === 0 ? (
              <div className="supportTicketsEmpty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted)", marginBottom: 12 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <p>{T("No tickets yet.", "Aucun ticket pour l'instant.")}</p>
                <button className="btn sm" style={{ marginTop: 8 }} onClick={() => { setShowTicketForm(true); }}>
                  {T("Create your first ticket", "Créer votre premier ticket")}
                </button>
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table className="dataTable" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      {[T("Subject", "Sujet"), T("Status", "Statut"), T("Date", "Date")].map((h, i) => (
                        <th key={i}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(t => (
                      <tr key={t.id} style={{ cursor: "pointer" }} onClick={() => router.push(`/support/${t.id}`)}>
                        <td style={{ fontWeight: 600, fontSize: 14 }}>{t.subject}</td>
                        <td>
                          <span className={`ticketBadge ${STATUS_CLASS[t.status] || ""}`}>{STATUS_LABEL[t.status] || t.status}</span>
                        </td>
                        <td style={{ color: "var(--muted)", fontSize: 13 }}>{formatDate(t.created_at, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── NEW TICKET MODAL (global, works from any tab) ── */}
        {showTicketForm && (
          <div className="supportTicketOverlay" onClick={() => setShowTicketForm(false)}>
            <div className="supportTicketModal" onClick={e => e.stopPropagation()}>
              <div className="supportTicketModalHeader">
                <span className="supportTicketModalTitle">{T("Create a ticket", "Créer un ticket")}</span>
                <button className="supportTicketModalClose" onClick={() => setShowTicketForm(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <form className="supportTicketForm" onSubmit={(e) => void onCreateTicket(e)}>
                <div className="field">
                  <label>{T("Subject", "Sujet")}</label>
                  <input className="inputField" value={subject} onChange={e => setSubject(e.target.value)} placeholder={T("Briefly describe your issue…", "Décrivez brièvement votre problème…")} />
                </div>
                <div className="field">
                  <label>{T("Message", "Message")}</label>
                  <textarea className="inputField" rows={4} value={ticketMsg} onChange={e => setTicketMsg(e.target.value)} placeholder={T("Provide as much detail as possible…", "Donnez le maximum de détails…")} style={{ resize: "vertical" }} />
                </div>
                {ticketError && <div className="fieldError">{ticketError}</div>}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button type="button" className="btn ghost sm" onClick={() => setShowTicketForm(false)}>{T("Cancel", "Annuler")}</button>
                  <button type="submit" className="btn primary sm" disabled={submitting || !subject.trim() || !ticketMsg.trim()}>
                    {submitting ? T("Sending…", "Envoi…") : T("Send ticket", "Envoyer")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
