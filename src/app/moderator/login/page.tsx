"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { moderatorLogin } from "@/lib/api";

const MOD_TOKEN_KEY = "mod_token";

export default function ModeratorLoginPage() {
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
    const t = localStorage.getItem(MOD_TOKEN_KEY);
    if (t) router.replace("/moderator");
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;
    setBusy(true);
    setError("");
    try {
      const out = await moderatorLogin(email.trim(), password);
      if (!out.token) throw new Error("NO_TOKEN");
      localStorage.setItem(MOD_TOKEN_KEY, out.token);
      if (out.moderator) localStorage.setItem("mod_info", JSON.stringify(out.moderator));
      router.replace("/moderator");
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
          <div className="authLogoIcon">M</div>
          <div className="authLogoText">Espace Modérateur</div>
        </div>

        <h1 className="authTitle">Connexion modérateur</h1>
        <p className="authSubtitle">Accès réservé à la gestion du blog.</p>

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
