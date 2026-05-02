"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { useSession } from "@/contexts/SessionContext";
import { fetchTicket, replyTicket, closeTicket, type SupportTicket, type SupportMessage } from "@/lib/api";
import { useLang } from "@/contexts/LangContext";
import { tr } from "@/lib/i18n";

function formatTime(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function TicketPage() {
  const { token } = useSession();
  const params    = useParams<{ id: string }>();
  const router    = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { lang }  = useLang();
  const T = (en: string, fr: string) => tr(lang, en, fr);
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  const STATUS_LABEL: Record<string, string> = {
    open:        T("Open",        "Ouvert"),
    in_progress: T("In progress", "En cours"),
    closed:      T("Closed",      "Fermé"),
  };
  const STATUS_CLASS: Record<string, string> = {
    open: "ticketBadge--open", in_progress: "ticketBadge--progress", closed: "ticketBadge--closed",
  };

  const [ticket,   setTicket]   = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [reply,    setReply]    = useState("");
  const [sending,  setSending]  = useState(false);
  const [closing,  setClosing]  = useState(false);
  const [error,    setError]    = useState("");

  const load = useCallback(async () => {
    if (!token || !params.id) return;
    try {
      const res = await fetchTicket(token, params.id);
      setTicket(res.ticket);
      setMessages(res.messages || []);
    } catch { setError(T("Failed to load this ticket.", "Impossible de charger ce ticket.")); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, params.id]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function onReply() {
    if (!token || !reply.trim() || !params.id) return;
    setSending(true);
    try {
      await replyTicket(token, params.id, reply.trim());
      setReply("");
      await load();
    } catch { setError(T("Failed to send the message.", "Impossible d'envoyer le message.")); }
    finally { setSending(false); }
  }

  async function onClose() {
    if (!token || !params.id || !confirm(T("Close this ticket?", "Fermer ce ticket ?"))) return;
    setClosing(true);
    try {
      await closeTicket(token, params.id);
      await load();
    } catch { setError(T("Failed to close the ticket.", "Impossible de fermer le ticket.")); }
    finally { setClosing(false); }
  }

  const isClosed = ticket?.status === "closed";

  return (
    <AppLayout>
      <div className="pageHeader">
        <div className="pageTitleGroup">
          {/* Back button */}
          <button className="ticketBackBtn" onClick={() => router.push("/support?tab=tickets")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            {T("My tickets", "Mes tickets")}
          </button>
          <h1 className="pageTitle" style={{ marginTop: 10 }}>{ticket?.subject || "Ticket"}</h1>
          {ticket && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <span className={`ticketBadge ${STATUS_CLASS[ticket.status] || ""}`}>{STATUS_LABEL[ticket.status] || ticket.status}</span>
              <span className="pageSubtitle" style={{ margin: 0 }}>{new Date(ticket.created_at).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          )}
        </div>
        {ticket && !isClosed && (
          <button className="ticketCloseBtn" onClick={() => void onClose()} disabled={closing}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            {closing ? T("Closing…", "Fermeture…") : T("Close ticket", "Fermer le ticket")}
          </button>
        )}
      </div>

      <div className="pageContent">
        {error && <div className="errorBox">{error}</div>}

        {loading ? (
          <p style={{ color: "var(--muted)", fontSize: 13 }}>{T("Loading…", "Chargement…")}</p>
        ) : (
          <div className="ticketDetailWrap">

            {/* Messages */}
            <div className="ticketThreadNew">
              {messages.map(m => {
                const isAdmin = m.sender_type === "admin";
                return (
                  <div key={m.id} className={`ticketMsgNew ${isAdmin ? "ticketMsgNew--admin" : "ticketMsgNew--user"}`}>
                    <div className="ticketMsgAvatar">
                      {isAdmin ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      ) : (
                        <span>{(m.sender_name || "U").slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="ticketMsgContent">
                      <div className="ticketMsgMeta">
                        <span className="ticketMsgAuthor">{isAdmin ? "Support" : (m.sender_name || T("You", "Vous"))}</span>
                        <span className="ticketMsgTime">{formatTime(m.created_at, locale)}</span>
                      </div>
                      <div className="ticketMsgBody">{m.content}</div>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <p style={{ color: "var(--muted)", fontSize: 13, padding: "24px" }}>{T("No messages yet.", "Aucun message pour l'instant.")}</p>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Reply or closed notice */}
            {isClosed ? (
              <div className="ticketClosedNotice">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {T("This ticket is closed.", "Ce ticket est fermé.")}
              </div>
            ) : (
              <div className="ticketReplyBar">
                <textarea
                  className="ticketReplyInput"
                  rows={3}
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder={T("Write your reply…", "Écrivez votre réponse…")}
                  onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void onReply(); }}
                />
                <div className="ticketReplyActions">
                  <span className="ticketReplyHint">⌘↵ {T("to send", "pour envoyer")}</span>
                  <button className="btnSaveProfile" onClick={() => void onReply()} disabled={sending || !reply.trim()}>
                    {sending ? (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.7s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        {T("Sending…", "Envoi…")}
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        {T("Send reply", "Envoyer")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
