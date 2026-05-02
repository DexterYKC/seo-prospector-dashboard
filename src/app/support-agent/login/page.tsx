"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supportAgentLogin } from "@/lib/api";

const AGENT_TOKEN_KEY = "agent_token";

export default function SupportAgentLoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState("");

  const canSubmit = useMemo(
    () => email.trim().length > 3 && password.length >= 6,
    [email, password]
  );

  useEffect(() => {
    const t = localStorage.getItem(AGENT_TOKEN_KEY);
    if (t) router.replace("/support-agent");
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;
    setBusy(true);
    setError("");
    try {
      const out = await supportAgentLogin(email.trim(), password);
      if (!out.token) throw new Error("NO_TOKEN");
      localStorage.setItem(AGENT_TOKEN_KEY, out.token);
      if (out.agent) localStorage.setItem("agent_info", JSON.stringify(out.agent));
      router.replace("/support-agent");
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="authShell">
      <div className="authCard">
        <div className="authLogo">
          <div className="authLogoIcon">S</div>
          <div className="authLogoText">Espace Support</div>
        </div>

        <h1 className="authTitle">Connexion agent support</h1>
        <p className="authSubtitle">Accès réservé à la gestion des tickets et utilisateurs.</p>

        <form onSubmit={(e) => void onSubmit(e)} className="formStack">
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="support@example.com"
            />
          </div>

          <div className="field">
            <label>Mot de passe</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <div className="errorBox">{error}</div>}

          <button type="submit" className="btn primary" disabled={!canSubmit || busy}>
            {busy ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </section>
  );
}
