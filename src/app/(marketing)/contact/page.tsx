"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";

const CATEGORIES = [
  { value: "general",     label: "General question",   email: "support@example.com" },
  { value: "billing",     label: "Billing & plans",    email: "support@example.com" },
  { value: "bug",         label: "Bug report",         email: "support@example.com" },
  { value: "partnership", label: "Partnership",        email: "support@example.com" },
  { value: "legal",       label: "Legal / compliance", email: "support@example.com" },
];

export default function ContactPage() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [category, setCategory] = useState("general");
  const [message,  setMessage]  = useState("");
  const [done,     setDone]     = useState(false);

  const canSubmit = name.trim().length > 1 && email.includes("@") && message.trim().length > 10;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const cat = CATEGORIES.find((c) => c.value === category) ?? CATEGORIES[0];
    const subject = encodeURIComponent("[" + cat.label + "] Message from " + name);
    const body = encodeURIComponent("Name: " + name + "\nEmail: " + email + "\nCategory: " + cat.label + "\n\n" + message);
    window.open("mailto:" + cat.email + "?subject=" + subject + "&body=" + body, "_blank");
    setDone(true);
  }

  return (
    <div className="contact-page">
      <MarketingNav />
      <main className="contact-page-main">
        <div className="container">
          <p className="contact-page-kicker">Contact</p>
          <div className="contact-grid">

            <div className="contact-info">
              <h1>Get in touch</h1>
              <p className="contact-info-text">
                Questions about the product, your plan, or anything else — we respond to every message within one business day.
              </p>
              <div className="contact-channel">
                <div className="contact-channel-dot contact-channel-dot--support" />
                <div className="contact-channel-body">
                  <h3>General support</h3>
                  <p>Product questions, extension issues, account help.</p>
                  <a href="mailto:support@example.com">support@example.com</a>
                </div>
              </div>
              <div className="contact-channel">
                <div className="contact-channel-dot contact-channel-dot--billing" />
                <div className="contact-channel-body">
                  <h3>Billing &amp; plans</h3>
                  <p>Subscriptions, invoices, upgrades and refunds.</p>
                  <a href="mailto:support@example.com">support@example.com</a>
                </div>
              </div>
              <div className="contact-channel">
                <div className="contact-channel-dot contact-channel-dot--legal" />
                <div className="contact-channel-body">
                  <h3>Legal / compliance</h3>
                  <p>Data requests, GDPR, privacy policy questions.</p>
                  <a href="mailto:support@example.com">support@example.com</a>
                </div>
              </div>
              <p className="contact-info-note">
                Already a customer? Open a ticket from your{" "}
                <a href="/support">dashboard</a>{" "}
                for faster handling.
              </p>
            </div>

            <div className="contact-form-card">
              {done ? (
                <div className="contact-success">
                  <div className="contact-success-check">✓</div>
                  <h2>Email client opened</h2>
                  <p>
                    Your message is ready to send. If nothing opened,{" "}
                    <a href={"mailto:" + (CATEGORIES.find((c) => c.value === category)?.email ?? "support@example.com")} style={{ color: "var(--brand)" }}>
                      click here
                    </a>{" "}
                    to send manually.
                  </p>
                  <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => { setDone(false); setMessage(""); }}>
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2>Send a message</h2>
                  <p className="contact-form-sub">We&apos;ll reply within 1 business day.</p>
                  <form onSubmit={onSubmit} className="contact-form-stack">
                    <div className="contact-field-row">
                      <div className="contact-field">
                        <label htmlFor="cf-name">Your name</label>
                        <input id="cf-name" type="text" autoComplete="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div className="contact-field">
                        <label htmlFor="cf-email">Your email</label>
                        <input id="cf-email" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                    </div>
                    <div className="contact-field">
                      <label htmlFor="cf-category">Category</label>
                      <select id="cf-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="contact-field">
                      <label htmlFor="cf-message">Message</label>
                      <textarea id="cf-message" placeholder="Describe your question or issue in detail..." value={message} onChange={(e) => setMessage(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={!canSubmit} style={{ marginTop: 4 }}>
                      Send message
                    </button>
                    <p style={{ fontSize: 11, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                      Clicking &ldquo;Send message&rdquo; opens your email client with a pre-filled draft.
                    </p>
                  </form>
                </>
              )}
            </div>

          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
