"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useSession } from "@/contexts/SessionContext";
import { useUserData } from "@/contexts/UserContext";
import { useLang } from "@/contexts/LangContext";
import { tr } from "@/lib/i18n";

type ChatMessage = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_by: string[];
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

export default function TeamChatPage() {
  const { token } = useSession();
  const { data } = useUserData();
  const { lang } = useLang();
  const T = (en: string, fr: string) => tr(lang, en, fr);

  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [input,    setInput]      = useState("");
  const [sending,  setSending]    = useState(false);
  const [loading,  setLoading]    = useState(true);
  const [myUserId, setMyUserId]   = useState<string | null>(null);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevLenRef  = useRef(0);
  const prevMsgIdsRef = useRef<Set<string>>(new Set());
  const myUserIdRef   = useRef<string | null>(null);
  const initialScrollDone = useRef(false);

  function playNotificationSound() {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch { /* browser may block without user gesture */ }
  }

  const user      = data?.user;
  const plan      = String(user?.plan || "FREE").toUpperCase();
  const isAgency  = plan === "AGENCY";
  const seatUsers = Array.isArray(data?.seatUsers) ? data!.seatUsers! : [];

  function getSenderName(senderId: string) {
    if (senderId === myUserId) {
      return user?.fullName?.split(" ")[0] || T("You", "Vous");
    }
    const u = seatUsers.find(u => u.userId === senderId);
    return u?.fullName?.split(" ")[0] || u?.email?.split("@")[0] || "Member";
  }

  function getInitials(senderId: string) {
    const name = getSenderName(senderId);
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  const fetchMessages = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/team/chat", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const payload = await res.json();
      if (payload.userId) {
        setMyUserId(payload.userId);
        myUserIdRef.current = payload.userId;
      }
      const msgs: ChatMessage[] = payload.messages || [];

      // detect new messages from others → play sound
      if (prevMsgIdsRef.current.size > 0) {
        const hasNewFromOther = msgs.some(
          m => !prevMsgIdsRef.current.has(m.id) && m.sender_id !== myUserIdRef.current
        );
        if (hasNewFromOther) playNotificationSound();
      }
      prevMsgIdsRef.current = new Set(msgs.map(m => m.id));

      setMessages(msgs);

      // scroll on new messages
      if (msgs.length > prevLenRef.current) {
        prevLenRef.current = msgs.length;
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token]);

  // Initial load
  useEffect(() => { void fetchMessages(); }, [fetchMessages]);

  // Scroll to bottom after first load
  useEffect(() => {
    if (!loading && messages.length > 0 && !initialScrollDone.current) {
      initialScrollDone.current = true;
      bottomRef.current?.scrollIntoView();
    }
  }, [loading, messages.length]);

  // Poll every 4s
  useEffect(() => {
    const id = setInterval(() => void fetchMessages(true), 4000);
    return () => clearInterval(id);
  }, [fetchMessages]);

  async function sendMessage() {
    if (!token || !input.trim() || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);
    try {
      await fetch("/api/team/chat", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      await fetchMessages(true);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  // Non-agency upsell
  if (data && !isAgency) {
    return (
      <AppLayout>
        <div className="pageHeader">
          <div className="pageTitleGroup">
            <div className="pageTitleIconBox">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </div>
            <div>
              <h1 className="pageTitle">{T("Team Chat", "Chat d'équipe")}</h1>
              <p className="pageSubtitle">{T("Agency plan required", "Plan Agency requis")}</p>
            </div>
          </div>
        </div>
        <div className="pageContent">
          <article className="card extensionBanner">
            <div className="extensionBannerBody">
              <div className="extensionBannerEmoji">💬</div>
              <div>
                <div className="extensionBannerTitle">
                  {T("Team chat is an Agency feature", "Le chat d'équipe est une fonctionnalité Agency")}
                </div>
                <div className="extensionBannerSub">
                  {T(
                    "Upgrade to the Agency plan to chat with your team in real time.",
                    "Passez au plan Agency pour chatter avec votre équipe en temps réel."
                  )}
                </div>
                <a href="/account" className="btn primary" style={{ marginTop: 16, display: "inline-flex" }}>
                  {T("View plans →", "Voir les plans →")}
                </a>
              </div>
            </div>
          </article>
        </div>
      </AppLayout>
    );
  }

  // Group messages by date
  const groups: { date: string; msgs: ChatMessage[] }[] = [];
  for (const msg of messages) {
    const d = formatDateLabel(msg.created_at);
    const last = groups[groups.length - 1];
    if (last?.date === d) last.msgs.push(msg);
    else groups.push({ date: d, msgs: [msg] });
  }

  // Who sent a message in the last 10 min → "online"
  const tenMinAgo = Date.now() - 10 * 60 * 1000;
  const recentSenders = new Set(
    messages
      .filter(m => new Date(m.created_at).getTime() > tenMinAgo)
      .map(m => m.sender_id)
  );
  // Current user always online (they're here right now)
  if (myUserId) recentSenders.add(myUserId);

  function getMemberInitials(u: { fullName?: string; email?: string }) {
    const name = u.fullName || u.email?.split("@")[0] || "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  return (
    <AppLayout>
      <div className="chatShell">

        {/* Header */}
        <div className="chatHeader">
          <div className="chatHeaderLeft">
            <span className="chatChannelHash">#</span>
            <span className="chatChannelName">general</span>
            <span className="chatHeaderMeta" style={{ marginLeft: 10 }}>
              {seatUsers.length} {T("members", "membres")}
            </span>
          </div>
          {/* Member avatars row */}
          <div className="chatMemberPills">
            {seatUsers.map(u => {
              const online = u.userId ? recentSenders.has(u.userId) : false;
              const ini = getMemberInitials(u);
              const name = u.fullName || u.email?.split("@")[0] || "?";
              return (
                <div key={u.userId} className="chatMemberPill" title={name}>
                  <div className={`chatMemberPillAvatar${u.userId === myUserId ? " chatMemberPillAvatar--me" : ""}`}>
                    {ini}
                  </div>
                  <span className={`chatMemberDot${online ? " chatMemberDot--online" : ""}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Messages */}
        <div className="chatMessages">
          {loading ? (
            <div className="chatEmptyState">
              <span className="muted">{T("Loading…", "Chargement…")}</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="chatEmptyState">
              <div className="chatEmptyIcon">👋</div>
              <div className="chatEmptyTitle">
                {T("Say hello to your team!", "Dites bonjour à votre équipe !")}
              </div>
              <div className="chatEmptyDesc">
                {T(
                  "This is the beginning of your team conversation.",
                  "C'est le début de la conversation d'équipe."
                )}
              </div>
            </div>
          ) : (
            groups.map(group => (
              <div key={group.date}>
                <div className="chatDateDivider">
                  <span className="chatDateLabel">{group.date}</span>
                </div>
                {group.msgs.map((msg, i) => {
                  const isOwn       = msg.sender_id === myUserId;
                  const isSameAuthor = i > 0 && group.msgs[i - 1].sender_id === msg.sender_id;
                  return (
                    <div
                      key={msg.id}
                      className={[
                        "chatMsg",
                        isOwn        ? "chatMsg--own"     : "",
                        isSameAuthor ? "chatMsg--stacked" : "",
                      ].filter(Boolean).join(" ")}
                    >
                      {!isSameAuthor ? (
                        <div className={`chatMsgAvatar${isOwn ? " chatMsgAvatar--own" : ""}`}>
                          {getInitials(msg.sender_id)}
                        </div>
                      ) : (
                        <div className="chatMsgAvatarGap" />
                      )}
                      <div className="chatMsgContent">
                        {!isSameAuthor && (
                          <div className="chatMsgMeta">
                            <span className="chatMsgName">{getSenderName(msg.sender_id)}</span>
                            <span className="chatMsgTime">{formatTime(msg.created_at)}</span>
                          </div>
                        )}
                        <div className="chatMsgBubble">{msg.content}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chatInputWrap">
          <div className="chatInputInner">
            <textarea
              ref={textareaRef}
              className="chatTextarea"
              placeholder={T(
                "Message #general… (Enter to send, Shift+Enter for new line)",
                "Message #general… (Entrée pour envoyer, Maj+Entrée pour nouvelle ligne)"
              )}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              disabled={sending}
            />
            <button
              className="btn primary chatSendBtn"
              onClick={() => void sendMessage()}
              disabled={!input.trim() || sending}
            >
              {sending ? "…" : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              )}
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
