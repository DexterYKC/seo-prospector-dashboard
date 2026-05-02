"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError, fetchDashboard } from "@/lib/api";
import type { LeadRecord, SeoIssueItem, SeoUiFields, OpportunityDecision } from "@/lib/api";
import { useSession } from "@/contexts/SessionContext";
import { useUserData } from "@/contexts/UserContext";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/components/Toast";
import { useLang } from "@/contexts/LangContext";
import { tr } from "@/lib/i18n";

type SeoStatus = "critical" | "moderate" | "good";

function getSeoStatus(seoLevel: string, leadType: string): SeoStatus {
  const lvl = (seoLevel || "").toUpperCase();
  if (lvl === "CRITICAL") return "critical";
  if (lvl === "WEAK" || lvl === "MODERATE") return "moderate";
  if (lvl === "OK" || lvl === "GOOD") return "good";
  const lt = (leadType || "").toUpperCase();
  if (lt.includes("SEO CRITICAL") || lt.includes("HOT")) return "critical";
  if (lt.includes("WARM") || lt.includes("SEO MODERATE")) return "moderate";
  return "good";
}

const SCORE_ICON: Record<SeoStatus, string> = { critical: "!", moderate: "~", good: "✓" };

type CwvData = {
  mobilePerf: number | null;
  mobileA11y: number | null;
  psSeoScore: number | null;
  lcpMs: number | null;
  clsScore: number | null;
  fcpMs: number | null;
  tbtMs: number | null;
  cwvDelta: number | null;
  bestPractices: number | null;
  gatheredAt: string | null;
};

type SeoEntry = {
  id: string;
  lead: LeadRecord;
  company: string;
  website: string;
  status: SeoStatus;
  score: number | null;
  categoriesDisplay: Record<string, string> | null;
  siteType: string;
  techStack: string;
  websiteStatus: string;
  auditCoverage: string;
  role: string;
  seoIssues: SeoIssueItem[];
  seoPassed: string[];
  cwv: CwvData;
  reason: string;
};

type LeadSeoEntry = {
  leadId: string;
  lead: LeadRecord;
  personName: string;
  opps: SeoEntry[];
  primaryOpp: SeoEntry;
  worstStatus: SeoStatus;
};

type OppRecord = NonNullable<LeadRecord["opportunities"]>[number];

function buildEntry(
  id: string,
  lead: LeadRecord,
  company: string,
  website: string,
  opp: OppRecord | null,
  leadDecision: OpportunityDecision | undefined,
): SeoEntry {
  const uiRaw: SeoUiFields = opp?.ui ?? lead.ui ?? {};
  const leadSignals = leadDecision?.signals ?? {};

  const seoLevel = String(opp?.seoLevel ?? leadSignals.seoLevel ?? "");
  const leadType = String(opp?.leadType ?? leadDecision?.leadType ?? "COLD");
  const status = getSeoStatus(seoLevel, leadType);

  const score = typeof uiRaw.rawScore === "number" ? uiRaw.rawScore
    : typeof opp?.rawScore === "number" ? opp.rawScore
    : null;

  const rawIssues = Array.isArray(opp?.seoIssues) ? opp.seoIssues
    : Array.isArray(leadSignals.seoIssues) ? leadSignals.seoIssues
    : [];
  const seoIssues: SeoIssueItem[] = rawIssues.map((item) => ({
    key: item.key,
    msg: String(item.msg ?? item),
    severity: item.severity ?? "info",
  }));

  const categoriesDisplay =
    uiRaw.categoriesDisplay && typeof uiRaw.categoriesDisplay === "object"
      ? uiRaw.categoriesDisplay
      : null;

  const cwv: CwvData = {
    mobilePerf:    uiRaw.mobilePerf    ?? null,
    mobileA11y:    uiRaw.mobileA11y    ?? null,
    psSeoScore:    uiRaw.psSeoScore    ?? null,
    lcpMs:         uiRaw.lcpMs         ?? null,
    clsScore:      uiRaw.clsScore      ?? null,
    fcpMs:         uiRaw.fcpMs         ?? null,
    tbtMs:         uiRaw.tbtMs         ?? null,
    cwvDelta:      uiRaw.cwvDelta      ?? null,
    bestPractices: opp?.bestPractices  ?? null,
    gatheredAt:    opp?.gatheredAt     ?? null,
  };

  return {
    id, lead, company, website, status, score,
    categoriesDisplay,
    siteType:      String(uiRaw.siteTypeLabel ?? opp?.siteType ?? leadSignals.siteType ?? ""),
    techStack:     String(uiRaw.techStackLabel ?? leadSignals.techFingerprint?.cms ?? ""),
    websiteStatus: String(opp?.websiteStatus ?? leadSignals.websiteStatus ?? ""),
    auditCoverage: String(uiRaw.auditCoverageLabel ?? leadSignals.auditCoverage ?? ""),
    role:          String(opp?.role ?? leadSignals.role ?? ""),
    seoIssues,
    seoPassed: Array.isArray(opp?.seoPassed) ? opp.seoPassed : [],
    cwv,
    reason: String(opp?.reason ?? leadDecision?.reason ?? uiRaw.reason ?? ""),
  };
}

function getPersonName(lead: LeadRecord): string {
  const n = String(lead.name ?? "").trim();
  if (n) return n;
  return `${lead.firstName ?? ""} ${lead.lastName ?? ""}`.trim() || "Unknown";
}

function worstSeoStatus(opps: SeoEntry[]): SeoStatus {
  if (opps.some((o) => o.status === "critical")) return "critical";
  if (opps.some((o) => o.status === "moderate")) return "moderate";
  return "good";
}

function scoreColor(score: number | null): string {
  if (score === null) return "var(--muted)";
  if (score >= 75) return "#16a34a";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}

function cwvColor(value: number | null, thresholds: [number, number]): string {
  if (value === null) return "var(--muted)";
  if (value <= thresholds[0]) return "#16a34a";
  if (value <= thresholds[1]) return "#d97706";
  return "#dc2626";
}

const PASSED_EN: Record<string, string> = {
  "Pas de noindex":                            "No noindex",
  "robots.txt présent":                        "robots.txt present",
  "Sitemap index multi-fichiers détecté":      "Multi-file sitemap index detected",
  "Sitemap référencé dans robots.txt":         "Sitemap referenced in robots.txt",
  "Canonical HTTPS défini":                    "Canonical HTTPS defined",
  "H1 unique présent":                         "H1 unique present",
  "HTTPS actif":                               "HTTPS active",
  "Viewport mobile présent":                   "Mobile viewport present",
  "Rendu côté serveur — crawlabilité optimale":"Server-side rendering — optimal crawlability",
  "Scripts <head> bien maîtrisés":             "Scripts in <head> well managed",
  "HSTS activé":                               "HSTS enabled",
  "X-Frame-Options défini":                    "X-Frame-Options defined",
  "Content-Security-Policy présent":           "Content-Security-Policy present",
  "X-Content-Type-Options défini":             "X-Content-Type-Options defined",
  "Favicon présent":                           "Favicon present",
  "Web App Manifest (PWA) présent":            "Web App Manifest (PWA) present",
  "Version AMP liée":                          "AMP version linked",
  "Lazy loading images activé":                "Lazy loading images active",
  "og:image présent":                          "og:image present",
  "Hreflang: internationalisation active":     "Hreflang: international targeting active",
  "Schema Product/Offer détecté — bon pour le rich snippet e-commerce": "Schema Product/Offer detected — good for e-commerce rich snippet",
  "BreadcrumbList Schema détecté":             "BreadcrumbList Schema detected",
};

function translatePassedItem(str: string, lang: string): string {
  if (lang === "fr") return str;
  if (PASSED_EN[str]) return PASSED_EN[str];
  return str
    .replace(/^Sitemap XML présent — (\d+) URL\(s\) détectée\(s\)$/, "Sitemap XML present — $1 URL(s) detected")
    .replace(/^Title OK — (\d+) car\.$/, "Title OK — $1 chars.")
    .replace(/^Meta description OK — (\d+) car\.$/, "Meta description OK — $1 chars.")
    .replace(/^(\d+) H2(?:, (\d+) H3)? détectés$/, (_, h2, h3) => h3 ? `${h2} H2, ${h3} H3 detected` : `${h2} H2 detected`)
    .replace(/^Contenu estimé: ~(\d+) mots$/, "Estimated content: ~$1 words")
    .replace(/^Alt text complet — (\d+) images$/, "Complete alt text — $1 images")
    .replace("robots.txt présent", "robots.txt present")
    .replace("règle(s) Disallow", "Disallow rule(s)");
}

const SITE_TYPE_MAP: Record<string, { fr: string; en: string }> = {
  "📄 Site vitrine":   { fr: "Site vitrine",   en: "Brochure site"  },
  "👤 Site personnel": { fr: "Site personnel", en: "Personal site"  },
  "🚀 SSR moderne":    { fr: "SSR moderne",    en: "Modern SSR"     },
  "🏢 Enterprise":     { fr: "Enterprise",     en: "Enterprise"     },
  "⚡ JS Heavy":       { fr: "JS Heavy",       en: "JS Heavy"       },
  "⚡ SPA/App":        { fr: "SPA/App",        en: "SPA/App"        },
  "📝 CMS":            { fr: "CMS",            en: "CMS"            },
  "🔧 Site Builder":   { fr: "Site Builder",   en: "Site Builder"   },
  "🛍 E-commerce":     { fr: "E-commerce",     en: "E-commerce"     },
};
function translateSiteType(str: string, lang: string): string {
  if (!str) return str;
  const entry = SITE_TYPE_MAP[str];
  if (entry) return lang === "fr" ? entry.fr : entry.en;
  // Strip any leading emoji (2 chars + space)
  return str.replace(/^[\p{Emoji}\p{Emoji_Modifier_Base}]\s*/u, "");
}

const COVERAGE_EN: Record<string, string> = {
  "Audit complet":                 "Full audit",
  "Audit partiel — SPA/CSR":      "Partial audit — SPA/CSR",
  "Audit partiel — Site builder": "Partial audit — Site builder",
  "Site inaccessible":             "Site unreachable",
};
function translateCoverage(str: string, lang: string): string {
  if (lang === "fr" || !str) return str;
  return COVERAGE_EN[str] ?? str;
}

const ISSUES_EN: Record<string, string> = {
  "robots.txt introuvable":                                      "robots.txt not found",
  "sitemap.xml introuvable à /sitemap.xml":                      "sitemap.xml not found at /sitemap.xml",
  "Balise canonical absente":                                    "Canonical tag missing",
  "Canonical ne pointe pas en HTTPS":                            "Canonical does not point to HTTPS",
  "Meta description absente":                                    "Meta description missing",
  "og:image absent — partage social dégradé":                    "og:image missing — degraded social sharing",
  "og:title absent":                                             "og:title missing",
  "og:description absent":                                       "og:description missing",
  "Twitter Card absent":                                         "Twitter Card missing",
  "Favicon absent":                                              "Favicon missing",
  "Données structurées Schema.org absentes":                     "Schema.org structured data missing",
  "Aucun outil d'analytics détecté":                            "No analytics tool detected",
  "Aucun H2 — structure de contenu plate":                      "No H2 — flat content structure",
  "HSTS non activé (Strict-Transport-Security)":                "HSTS not enabled (Strict-Transport-Security)",
  "Sitemap présent mais vide ou illisible":                     "Sitemap present but empty or unreadable",
  "robots.txt ne référence pas le sitemap":                     "robots.txt does not reference the sitemap",
  "⛔ Balise <title> absente":                                   "⛔ <title> tag missing",
  "⛔ Balise H1 absente":                                        "⛔ H1 tag missing",
  "⛔ Meta robots: noindex détecté — page exclue des moteurs":  "⛔ Meta robots: noindex detected — page excluded from search engines",
  "⛔ Meta viewport absent — site non mobile-friendly":         "⛔ Meta viewport missing — site not mobile-friendly",
  "⛔ Site non HTTPS — critique pour le référencement":         "⛔ Site not HTTPS — critical for SEO",
  "⛔ robots.txt bloque tout le crawl (Disallow: /)":           "⛔ robots.txt blocks all crawling (Disallow: /)",
};
function translateIssueMsg(str: string, lang: string): string {
  if (lang === "fr" || !str) return str;
  if (ISSUES_EN[str]) return ISSUES_EN[str];
  return str
    .replace(/^Title trop long — (\d+) car\. \(max (\d+)\)$/, "Title too long — $1 chars. (max $2)")
    .replace(/^Title court — (\d+) car\. \(min (\d+)\)$/, "Title too short — $1 chars. (min $2)")
    .replace(/^(\d+)\/(\d+) images sans attribut alt$/, "$1/$2 images without alt attribute")
    .replace(/^Meta description trop courte — (\d+) car\. \(min (\d+)\)$/, "Meta description too short — $1 chars. (min $2)")
    .replace(/^Meta description trop longue — (\d+) car\. \(max (\d+)\)$/, "Meta description too long — $1 chars. (max $2)")
    .replace(/^Performance mobile critique: (\d+)\/100 — très lente$/, "Critical mobile performance: $1/100 — very slow")
    .replace(/^Performance mobile: (\d+)\/100 — lente$/, "Mobile performance: $1/100 — slow")
    .replace(/^LCP: ([\d.]+)s — très lent \(cible <2\.5s\)$/, "LCP: $1s — very slow (target <2.5s)")
    .replace(/^LCP: ([\d.]+)s — à améliorer \(cible <2\.5s\)$/, "LCP: $1s — needs improvement (target <2.5s)")
    .replace(/^CLS: ([\d.]+) — instable \(cible <0\.1\)$/, "CLS: $1 — unstable (target <0.1)")
    .replace(/^CLS: ([\d.]+) — à améliorer \(cible <0\.1\)$/, "CLS: $1 — needs improvement (target <0.1)");
}

function severityDot(sev: SeoIssueItem["severity"]): { color: string; icon: string } {
  if (sev === "critical") return { color: "#dc2626", icon: "⛔" };
  if (sev === "warning")  return { color: "#d97706", icon: "△" };
  return { color: "#6b7280", icon: "·" };
}

const TERM_TIPS_EN: Record<string, string> = {
  "LCP":   "Largest Contentful Paint — time for the main content to fully load (target: <2.5s).",
  "CLS":   "Cumulative Layout Shift — measures visual stability; high values mean elements jump around during load (target: <0.1).",
  "FCP":   "First Contentful Paint — time until the first element appears on screen.",
  "TBT":   "Total Blocking Time — how long the main thread is blocked, delaying user interactions (target: <200ms).",
  "HSTS":  "HTTP Strict Transport Security — forces browsers to always use HTTPS, improving security.",
  "noindex": "A noindex tag tells search engines to exclude this page from their index — the page won't appear in search results.",
  "canonical": "A canonical tag tells search engines which URL is the authoritative version of a page, preventing duplicate content issues.",
  "robots.txt": "A file that tells search engine crawlers which pages they can or can't access on your site.",
  "sitemap": "A sitemap lists all pages of your site, helping search engines discover and index your content faster.",
  "H1":    "The H1 is the main heading of a page — search engines use it to understand the topic of the page.",
  "Schema": "Schema.org structured data helps search engines understand your content and can unlock rich results (stars, FAQs, etc.).",
};
const TERM_TIPS_FR: Record<string, string> = {
  "LCP":   "Largest Contentful Paint — temps de chargement du contenu principal (cible : <2,5s).",
  "CLS":   "Cumulative Layout Shift — mesure la stabilité visuelle ; des valeurs élevées signifient que des éléments bougent au chargement (cible : <0,1).",
  "FCP":   "First Contentful Paint — temps jusqu'à l'affichage du premier élément visible.",
  "TBT":   "Total Blocking Time — durée pendant laquelle le thread principal est bloqué, retardant les interactions (cible : <200ms).",
  "HSTS":  "HTTP Strict Transport Security — force les navigateurs à toujours utiliser HTTPS.",
  "noindex": "La balise noindex indique aux moteurs de recherche d'exclure cette page de leur index — elle n'apparaîtra pas dans les résultats.",
  "canonical": "La balise canonical indique aux moteurs quelle URL est la version de référence, évitant les problèmes de contenu dupliqué.",
  "robots.txt": "Fichier indiquant aux robots des moteurs quelles pages ils peuvent ou ne peuvent pas explorer.",
  "sitemap": "Fichier listant toutes les pages du site pour aider les moteurs à les découvrir et les indexer plus rapidement.",
  "H1":    "Le H1 est le titre principal d'une page — les moteurs s'en servent pour comprendre le sujet de la page.",
  "Schema": "Les données structurées Schema.org aident les moteurs à comprendre votre contenu et peuvent activer des résultats enrichis.",
};

function getIssueTip(msg: string, lang: string): string | null {
  const dict = lang === "fr" ? TERM_TIPS_FR : TERM_TIPS_EN;
  const upper = msg.toUpperCase();
  for (const [term, tip] of Object.entries(dict)) {
    if (upper.includes(term.toUpperCase())) return tip;
  }
  return null;
}

function SiteLogo({ website, company }: { website: string; company: string }) {
  const [step, setStep] = useState(0);
  const domain = website ? (() => { try { const u = website.startsWith("http") ? website : `https://${website}`; return new URL(u).hostname.replace(/^www\./, ""); } catch { return null; } })() : null;
  const initial = (company.charAt(0) || "?").toUpperCase();
  const srcs = domain ? [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    `https://logo.clearbit.com/${domain}`,
  ] : [];
  if (domain && step < srcs.length) {
    return (
      <div style={{ width: 36, height: 36, borderRadius: 6, overflow: "hidden", flexShrink: 0, border: "1px solid var(--line)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img key={srcs[step]} src={srcs[step]} alt={company} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={() => setStep(s => s + 1)} />
      </div>
    );
  }
  return (
    <div style={{ width: 36, height: 36, borderRadius: 6, flexShrink: 0, border: "1px solid var(--line)", background: "linear-gradient(135deg, #e0e7ff, #c7d2fe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#4f46e5" }}>
      {initial}
    </div>
  );
}

function ProfileAvatar({ lead, name, status, score }: {
  lead: LeadRecord; name: string; status: SeoStatus; score: number | null;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = name.split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "?";
  const badgeColor = status === "critical" ? "#ef4444" : status === "moderate" ? "#f59e0b" : "#10b981";

  return (
    <div style={{ position: "relative", width: 50, height: 50, flexShrink: 0 }}>
      {lead.avatarUrl && !imgFailed ? (
        <img
          src={lead.avatarUrl}
          alt={name}
          style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", display: "block" }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div style={{
          width: 50, height: 50, borderRadius: "50%",
          background: "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 800, color: "#4f46e5",
        }}>
          {initials}
        </div>
      )}
      <div style={{
        position: "absolute", bottom: -4, right: -6,
        minWidth: 26, height: 26, borderRadius: 13,
        background: badgeColor,
        color: "#fff", fontSize: 11, fontWeight: 900,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 5px", lineHeight: 1,
        border: "2.5px solid #fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.22)",
      }}>
        {score !== null ? score : SCORE_ICON[status]}
      </div>
    </div>
  );
}

export default function SeoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, setToken } = useSession();
  const { data: userData } = useUserData();
  const { lang } = useLang();
  const { toast } = useToast();
  const T = (en: string, fr: string) => tr(lang, en, fr);

  const plan        = String(userData?.user?.plan || "FREE").toUpperCase();
  const trialEndsAt = userData?.user?.trialEndsAt;
  const trialActive = trialEndsAt ? Date.parse(trialEndsAt) > Date.now() : false;
  const isFreeLocked = plan === "FREE" && !trialActive;

  const getStatusLabel = (s: SeoStatus) => {
    if (s === "critical") return T("Critical", "Critique");
    if (s === "moderate") return T("Moderate", "Modéré");
    return T("Healthy", "Sain");
  };

  const [leads,              setLeads]              = useState<LeadRecord[]>([]);
  const [busy,               setBusy]               = useState(false);
  const [exportingCsv,       setExportingCsv]       = useState(false);
  const [error,              setError]              = useState("");
  const [selectedLeadEntry,  setSelectedLeadEntry]  = useState<LeadSeoEntry | null>(null);
  const [selectedOppId,      setSelectedOppId]      = useState<string | null>(null);
  const [search,             setSearch]             = useState("");
  const [filter,             setFilter]             = useState<SeoStatus | "ALL">("ALL");
  const profileListRef = useRef<HTMLDivElement>(null);
  const [profileOverflows, setProfileOverflows] = useState(false);

  useEffect(() => {
    const el = profileListRef.current;
    if (!el) return;
    const check = () => setProfileOverflows(el.scrollHeight > el.clientHeight + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [leads, search, filter]);

  const load = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setError("");
    try {
      const out = await fetchDashboard(token);
      setLeads(Array.isArray(out.leads) ? out.leads : []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setToken(null); router.replace("/login"); return;
      }
      setError(err instanceof ApiError ? err.message : "LOAD_FAILED");
    } finally {
      setBusy(false);
    }
  }, [token, setToken, router]);

  useEffect(() => { void load(); }, [load]);

  const exportSeoAudit = useCallback(async (lead: LeadRecord, opportunityId: string | null) => {
    if (!token || exportingCsv) return;
    setExportingCsv(true);
    try {
      const res = await fetch(`/api/seo/export-single`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ lead, opportunityId, language: lang, format: "csv" }),
      });
      const data = await res.json() as { ok?: boolean; csv?: string; filename?: string; mimeType?: string; error?: string };
      if (data.error === "SEO_EXPORT_QUOTA_REACHED") throw new Error(T("Export quota reached for this month.", "Quota d'export atteint pour ce mois."));
      if (data.error === "FEATURE_DISABLED_EXPORT_CSV") throw new Error(T("CSV export requires a paid plan.", "L'export CSV nécessite un plan payant."));
      if (!data.ok || !data.csv) throw new Error(data.error ?? "EXPORT_FAILED");
      const blob = new Blob([data.csv], { type: data.mimeType ?? "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = data.filename ?? "seo-audit.csv";
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast(err instanceof Error ? err.message : T("Export failed.", "Échec de l'export."), "error");
    } finally {
      setExportingCsv(false);
    }
  }, [token, lang, exportingCsv]);

  const allLeadEntries = useMemo((): LeadSeoEntry[] => {
    const entries: LeadSeoEntry[] = [];
    for (const lead of leads) {
      const rawOpps = Array.isArray(lead.opportunities) ? lead.opportunities : [];
      const seoOpps: SeoEntry[] = rawOpps.length === 0
        ? [buildEntry(lead.id ?? `lead-${entries.length}`, lead, String(lead.company ?? "—"), String(lead.website ?? "—"), null, lead.decision)]
        : rawOpps.map((opp, i) => buildEntry(
            opp.id ?? `opp-${entries.length}-${i}`, lead,
            String(opp.company ?? lead.company ?? "—"),
            String(opp.website ?? lead.website ?? "—"),
            opp, lead.decision,
          ));

      // Sort opps: always by criticality (critical first, then moderate, then good)
      const orderedOpps = [...seoOpps].sort((a, b) => {
        const ord: Record<SeoStatus, number> = { critical: 0, moderate: 1, good: 2 };
        if (ord[a.status] !== ord[b.status]) return ord[a.status] - ord[b.status];
        // Same status: lowest score first (more broken = higher priority)
        const sA = a.score ?? 999;
        const sB = b.score ?? 999;
        return sA - sB;
      });

      entries.push({
        leadId:      lead.id ?? `lead-${entries.length}`,
        lead,
        personName:  getPersonName(lead),
        opps:        orderedOpps,
        primaryOpp:  orderedOpps[0],
        worstStatus: worstSeoStatus(seoOpps),
      });
    }
    return entries.sort((a, b) => {
      const order: Record<SeoStatus, number> = { critical: 0, moderate: 1, good: 2 };
      return order[a.worstStatus] - order[b.worstStatus];
    });
  }, [leads]);

  // Deep-link: re-runs whenever allLeadEntries loads or selectedLeadEntry is cleared,
  // normalizes URL path to handle trailing-slash / www mismatches
  useEffect(() => {
    if (selectedLeadEntry !== null || allLeadEntries.length === 0) return;
    const raw = searchParams.get("profileUrl");
    if (!raw) return;
    const normPath = (u: string) => {
      try { return new URL(u).pathname.replace(/\/$/, "").toLowerCase(); }
      catch { return u.toLowerCase().replace(/\/$/, ""); }
    };
    const targetPath = normPath(raw);
    const entry = allLeadEntries.find((e) => normPath(e.lead.profileUrl ?? "") === targetPath);
    if (!entry) return;
    setSelectedLeadEntry(entry);
    setSelectedOppId(entry.opps[0]?.id ?? null);
  }, [allLeadEntries, searchParams, selectedLeadEntry]);

  const counts = useMemo(() => ({
    ALL:      allLeadEntries.length,
    critical: allLeadEntries.filter((e) => e.worstStatus === "critical").length,
    moderate: allLeadEntries.filter((e) => e.worstStatus === "moderate").length,
    good:     allLeadEntries.filter((e) => e.worstStatus === "good").length,
  }), [allLeadEntries]);

  const filtered = useMemo(() => {
    let list = allLeadEntries;
    if (filter !== "ALL") list = list.filter((e) => e.worstStatus === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((e) =>
        e.personName.toLowerCase().includes(q) ||
        e.opps.some((o) => o.company.toLowerCase().includes(q) || o.website.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allLeadEntries, filter, search]);

  // Resolve the selected lead entry (deep-link selection is handled by useEffect above)
  const selEntry = selectedLeadEntry
    ? (filtered.find((e) => e.leadId === selectedLeadEntry.leadId) ?? filtered[0] ?? null)
    : filtered[0] ?? null;

  // Resolve the selected opportunity SeoEntry
  const sel: SeoEntry | null = selEntry
    ? (selEntry.opps.find((o) => o.id === selectedOppId) ?? selEntry.primaryOpp)
    : null;

  const hasCwv = sel && (sel.cwv.mobilePerf !== null || sel.cwv.lcpMs !== null);

  return (
    <AppLayout>
      <div className="pageHeader">
        <div className="pageTitleGroup">
          <div className="pageTitleIconBox">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 18.5h16"/><path d="M7 16v-3.5M12 16V8.5M17 16v-5"/><path d="M6 9.5l4-3 4 2 4-3"/></svg>
          </div>
          <div>
            <h1 className="pageTitle">{T("SEO Opportunities", "Opportunités SEO")}</h1>
            <p className="pageSubtitle">{T("Spot opportunities and prioritize your outreach", "Identifiez les opportunités et priorisez vos actions")}</p>
          </div>
        </div>
        <button className="btnRefresh" onClick={() => void load()} disabled={busy} title={T("Refresh", "Actualiser")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.5s ease", transform: busy ? "rotate(360deg)" : "none" }}>
              <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
          </button>
      </div>

      <div className="pageContent">
        {error && <div className="errorBox">{error}</div>}

        {allLeadEntries.length === 0 && !busy ? (
          <article className="card extensionBanner">
            <div className="extensionBannerBody">
              <div className="extensionBannerEmoji">
                <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="40" height="40" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg>
              </div>
              <div>
                <div className="extensionBannerTitle">{T("No SEO data yet", "Aucune donnée SEO pour l'instant")}</div>
                <div className="extensionBannerSub">
                  {T("Each LinkedIn profile you visit with the extension is automatically scored for SEO opportunities. Start browsing to populate this page.", "Chaque profil LinkedIn visité avec l'extension est automatiquement analysé pour les opportunités SEO. Commencez à naviguer pour alimenter cette page.")}
                </div>
                <a href="/dashboard" className="btn primary" style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, paddingLeft: 20, paddingRight: 20, fontWeight: 700, fontSize: 14 }}>
                  {T("Go to Dashboard", "Aller au tableau de bord")}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                </a>
              </div>
            </div>
          </article>
        ) : (
          <>
            {/* Stat-card filters — aligned with left column */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 14 }}>
              <div className="leadStatBar" style={{ padding: 0 }}>
                {([
                  { f: "ALL",      label: T("All", "Tous"),          color: "var(--brand)", bg: "rgba(99,102,241,0.08)"  },
                  { f: "critical", label: T("Critical", "Critique"), color: "#ef4444",      bg: "rgba(239,68,68,0.08)"   },
                  { f: "moderate", label: T("Moderate", "Modéré"),   color: "#f59e0b",      bg: "rgba(245,158,11,0.08)"  },
                  { f: "good",     label: T("Healthy", "Sain"),      color: "#10b981",      bg: "rgba(16,185,129,0.08)"  },
                ] as const).map(({ f, label, color, bg }, i, arr) => {
                  const active = filter === f;
                  return (
                    <button
                      key={f}
                      className="leadStatItem"
                      onClick={() => { setFilter(f as typeof filter); setSelectedLeadEntry(null); setSelectedOppId(null); }}
                      style={{
                        background: active ? color : bg,
                        borderRight: i < arr.length - 1 ? "1px solid var(--line)" : "none",
                        cursor: "pointer", border: "none", minWidth: 80,
                        transition: "background 0.18s, transform 0.18s ease, box-shadow 0.18s ease",
                      }}
                    >
                      <span className="leadStatNum" style={{ color: active ? "#fff" : color, fontSize: 20 }}>
                        {counts[f as keyof typeof counts]}
                      </span>
                      <span className="leadStatLabel" style={{ color: active ? "rgba(255,255,255,0.85)" : "var(--muted)" }}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="seoGrid">
              {/* Left — profiles list */}
              <article className={`card seoProfileCard${profileOverflows ? " seoProfileOverflows" : ""}`}>
                <div className="cardHeader">
                  <span className="cardTitle" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted)", flexShrink: 0 }}>
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/>
                    </svg>
                    {T("Profiles", "Profils")}
                  </span>
                  <input
                    className="tableSearch"
                    placeholder={T("Search…", "Rechercher…")}
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setSelectedLeadEntry(null); setSelectedOppId(null); }}
                    style={{ marginLeft: "auto" }}
                  />
                </div>
                <div className="cardBodyFlush" ref={profileListRef}>
                  {filtered.length === 0 ? (
                    <div className="emptyState">{T("No profiles match this filter.", "Aucun profil ne correspond à ce filtre.")}</div>
                  ) : (
                    filtered.map((entry) => (
                      <div
                        key={entry.leadId}
                        className={`seoAuditItem${selEntry?.leadId === entry.leadId ? " selected" : ""}`}
                        onClick={() => { setSelectedLeadEntry(entry); setSelectedOppId(entry.opps[0].id); }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <ProfileAvatar
                            lead={entry.lead}
                            name={entry.personName}
                            status={entry.worstStatus}
                            score={entry.opps.find((o) => o.status === entry.worstStatus)?.score ?? entry.primaryOpp.score}
                          />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                              <div className="seoAuditName truncate">{entry.personName}</div>
                              <span className={`seobadge ${entry.worstStatus}`}>{getStatusLabel(entry.worstStatus)}</span>
                            </div>
                            <div className="seoAuditUrl truncate" style={{ maxWidth: 200 }}>{entry.primaryOpp.company}</div>
                            {entry.opps.length > 1 && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4, background: "rgba(59,130,246,0.1)", color: "var(--brand)", fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 20, border: "1px solid rgba(59,130,246,0.2)" }}>
                                {entry.opps.length} {T("sites", "sites")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>

              {/* Right — detail */}
              {sel && selEntry && (
                <div key={sel.id} className="seoDetailPanel">

                  {/* Opportunity selector (only shown when lead has multiple sites) */}
                  {selEntry.opps.length > 1 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 2 }}>
                        {T("Site", "Site")}
                      </span>
                      {selEntry.opps.map((opp) => (
                        <button
                          key={opp.id}
                          className={`filterBtn ${sel.id === opp.id ? "active" : ""}`}
                          onClick={() => setSelectedOppId(opp.id)}
                        >
                          <span className={`seoStatusDot ${opp.status}`} />
                          {opp.company}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Single unified detail card */}
                  {(() => {
                    const statusAccent = sel.status === "critical" ? "#dc2626" : sel.status === "moderate" ? "#d97706" : "#16a34a";
                    return (
                  <article className="card" style={{ padding: 0, overflow: "hidden" }}>
                    {/* Header */}
                    <div className={`cardHeader seoDetailHeader seoDetailHeader--${sel.status}`} style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className={`seoScoreRing ${sel.status}`} style={{ width: 44, height: 44, fontSize: 16, flexShrink: 0 }}>
                          {sel.score !== null ? sel.score : SCORE_ICON[sel.status]}
                        </div>
                        {!isFreeLocked && <SiteLogo website={sel.website} company={sel.company} />}
                        <div>
                          <div className="cardTitle">{sel.company}</div>
                          <div className="small muted" style={{ marginTop: 2 }}>{sel.website}</div>
                        </div>
                      </div>
                      <span className={`seobadge ${sel.status}`}>{getStatusLabel(sel.status)}</span>
                    </div>

                    {/* Scrollable body */}
                    <div className="seoDetailScroll">

                      {/* Site info */}
                      <div className="seoDetailSection">
                        <div className="kv">
                          <span className="label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            {T("Website", "Site web")}
                          </span>
                          <a href={sel.website.startsWith("http") ? sel.website : `https://${sel.website}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>
                            {sel.website} ↗
                          </a>
                        </div>
                        <div className="kv">
                          <span className="label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            {T("Prospect", "Prospect")}
                          </span>
                          <span className="value">{selEntry.personName}</span>
                        </div>
                        {sel.lead.profileUrl && (
                          <div className="kv">
                            <span className="label">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                              LinkedIn
                            </span>
                            <a href={sel.lead.profileUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>
                              {T("View profile ↗", "Voir le profil ↗")}
                            </a>
                          </div>
                        )}
                        {sel.siteType && !isFreeLocked && (
                          <div className="kv">
                            <span className="label">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                              {T("Site type", "Type de site")}
                            </span>
                            <span className="value">{translateSiteType(sel.siteType, lang)}</span>
                          </div>
                        )}
                        {sel.techStack && (
                          <div className="kv">
                            <span className="label">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                              CMS / Stack
                            </span>
                            <span className="value">{sel.techStack}</span>
                          </div>
                        )}
                        {sel.auditCoverage && (
                          <div className="kv">
                            <span className="label">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                              {T("Coverage", "Couverture")}
                            </span>
                            <span className="value" style={{ color: isFreeLocked ? "#f59e0b" : (sel.auditCoverage.toLowerCase().includes("complet") || sel.auditCoverage.toLowerCase().includes("full") ? "#16a34a" : "var(--text)") }}>
                              {isFreeLocked ? T("Basic scan", "Scan basique") : translateCoverage(sel.auditCoverage, lang)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Free locked — CTA after site info */}
                      {isFreeLocked && (
                        <div style={{
                          margin: "4px 18px 16px", padding: "14px 16px", borderRadius: 8,
                          background: "var(--surface-soft)", border: "1px solid var(--line)",
                          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                        }}>
                          <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 7 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            <span>{T("Upgrade to unlock full audit details and CSV export.", "Passez à un plan payant pour accéder à l'audit complet et l'export CSV.")}</span>
                          </div>
                          <a href="/account" className="btnUpgradePro">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                            {T("Upgrade to Pro", "Passer à Pro")}
                          </a>
                        </div>
                      )}

                      {/* Score breakdown — premium only */}
                      {!isFreeLocked && sel.score !== null && (
                        <div className="seoDetailSection">
                          <div className="seoDetailSectionHead">
                            <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <span className="seoPulseDot" />
                              {T("SEO Score", "Score SEO")}
                            </span>
                            <span style={{ fontWeight: 900, color: scoreColor(sel.score) }}>{sel.score}/100</span>
                          </div>
                          {sel.categoriesDisplay && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", marginTop: 12 }}>
                              {Object.entries(sel.categoriesDisplay).map(([key, val]) => {
                                const [score, max] = val.split("/").map(Number);
                                const pct = max > 0 ? score / max : 0;
                                const col = pct >= 0.75 ? "#16a34a" : pct >= 0.5 ? "#d97706" : "#dc2626";
                                const label: Record<string, string> = {
                                  indexability: T("Indexability", "Indexabilité"),
                                  onPage: T("On-page", "On-page"),
                                  technical: T("Technical", "Technique"),
                                  social: T("Social", "Social"),
                                };
                                return (
                                  <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                                    <span style={{ color: "var(--muted)", fontWeight: 700 }}>{label[key] ?? key}</span>
                                    <span style={{ fontWeight: 900, color: col, fontSize: 14 }}>{val}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Issues — premium only */}
                      {!isFreeLocked && (<div className="seoDetailSection">
                        <div className="seoDetailSectionHead">
                          <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <span className="seoPulseDot" />
                            {T("Detected issues", "Problèmes détectés")}
                          </span>
                          {sel.seoIssues.length > 0 && (
                            <span className={`badge ${sel.status === "good" ? "good" : "bad"}`} style={{ fontSize: 13, padding: "3px 10px", fontWeight: 800 }}>{sel.seoIssues.length}</span>
                          )}
                        </div>
                        <div style={{ marginTop: 10 }}>
                          {sel.seoIssues.length === 0 ? (
                            <p className="muted small">{T("No issues detected.", "Aucun problème détecté.")}</p>
                          ) : (() => {
                            const sevOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 };
                            const sorted = [...sel.seoIssues].sort((a, b) => (sevOrder[a.severity ?? "info"] ?? 2) - (sevOrder[b.severity ?? "info"] ?? 2));
                            const groups: { sev: string; label: string; color: string; items: typeof sorted }[] = [
                              { sev: "critical", label: T("Critical", "Critique"),  color: "#dc2626", items: sorted.filter(i => i.severity === "critical") },
                              { sev: "warning",  label: T("Warnings", "Attention"), color: "#d97706", items: sorted.filter(i => i.severity === "warning")  },
                              { sev: "info",     label: T("Info", "Info"),          color: "#6b7280", items: sorted.filter(i => i.severity !== "critical" && i.severity !== "warning") },
                            ].filter(g => g.items.length > 0);
                            return (
                              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                {groups.map(g => (
                                  <div key={g.sev}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: g.color, flexShrink: 0, display: "inline-block" }} />
                                      <span style={{ fontSize: 12, fontWeight: 800, color: g.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{g.label}</span>
                                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginLeft: 2 }}>{g.items.length}</span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 16 }}>
                                      {g.items.map((issue, i) => {
                                        const tip = getIssueTip(issue.msg ?? "", lang);
                                        return (
                                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>
                                            <span style={{ color: g.color, flexShrink: 0, marginTop: 5, width: 6, height: 6, borderRadius: "50%", background: g.color, display: "inline-block" }} />
                                            <span style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                                              {translateIssueMsg(issue.msg ?? "", lang)}
                                              {tip && <span className="seoInfoTip" data-tip={tip}>?</span>}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>)}

                      {/* PageSpeed CWV — premium only */}
                      {!isFreeLocked && hasCwv && (
                        <div className="seoDetailSection">
                          <div className="seoDetailSectionHead">
                            <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <span className="seoPulseDot" />
                              PageSpeed — Mobile
                            </span>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", marginTop: 12 }}>
                            {sel.cwv.mobilePerf !== null && (
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                <span style={{ color: "var(--muted)", fontWeight: 700 }}>{T("Performance", "Performance")}</span>
                                <span style={{ fontWeight: 900, color: cwvColor(sel.cwv.mobilePerf, [89, 49]) }}>{sel.cwv.mobilePerf}/100</span>
                              </div>
                            )}
                            {sel.cwv.mobileA11y !== null && (
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                <span style={{ color: "var(--muted)", fontWeight: 700 }}>{T("Accessibility", "Accessibilité")}</span>
                                <span style={{ fontWeight: 900, color: cwvColor(sel.cwv.mobileA11y, [89, 69]) }}>{sel.cwv.mobileA11y}/100</span>
                              </div>
                            )}
                            {sel.cwv.psSeoScore !== null && (
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                <span style={{ color: "var(--muted)", fontWeight: 700 }}>SEO PageSpeed</span>
                                <span style={{ fontWeight: 900, color: cwvColor(sel.cwv.psSeoScore, [89, 69]) }}>{sel.cwv.psSeoScore}/100</span>
                              </div>
                            )}
                            {sel.cwv.lcpMs !== null && (
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                <span style={{ color: "var(--muted)", fontWeight: 700 }}>LCP</span>
                                <span style={{ fontWeight: 900, color: cwvColor(sel.cwv.lcpMs, [2500, 4000]) }}>{(sel.cwv.lcpMs / 1000).toFixed(1)}s</span>
                              </div>
                            )}
                            {sel.cwv.clsScore !== null && (
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                <span style={{ color: "var(--muted)", fontWeight: 700 }}>CLS</span>
                                <span style={{ fontWeight: 900, color: cwvColor(sel.cwv.clsScore, [0.1, 0.25]) }}>{sel.cwv.clsScore}</span>
                              </div>
                            )}
                            {sel.cwv.fcpMs !== null && (
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                <span style={{ color: "var(--muted)", fontWeight: 700 }}>FCP</span>
                                <span style={{ fontWeight: 900, color: cwvColor(sel.cwv.fcpMs, [1800, 3000]) }}>{(sel.cwv.fcpMs / 1000).toFixed(1)}s</span>
                              </div>
                            )}
                            {sel.cwv.tbtMs !== null && sel.cwv.tbtMs > 0 && (
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                <span style={{ color: "var(--muted)", fontWeight: 700 }}>TBT</span>
                                <span style={{ fontWeight: 900, color: cwvColor(sel.cwv.tbtMs, [200, 600]) }}>{sel.cwv.tbtMs}ms</span>
                              </div>
                            )}
                            {sel.cwv.cwvDelta !== null && (
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                <span style={{ color: "var(--muted)", fontWeight: 700 }}>{T("Score impact", "Impact score")}</span>
                                <span style={{ fontWeight: 900, color: sel.cwv.cwvDelta >= 0 ? "#16a34a" : sel.cwv.cwvDelta >= -5 ? "#d97706" : "#dc2626" }}>
                                  {sel.cwv.cwvDelta >= 0 ? "+" : ""}{sel.cwv.cwvDelta}
                                </span>
                              </div>
                            )}
                            {sel.cwv.bestPractices !== null && (
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                <span style={{ color: "var(--muted)", fontWeight: 700 }}>{T("Best practices", "Bonnes pratiques")}</span>
                                <span style={{ fontWeight: 900, color: scoreColor(sel.cwv.bestPractices) }}>{sel.cwv.bestPractices}/100</span>
                              </div>
                            )}
                            {sel.cwv.gatheredAt && (
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                <span style={{ color: "var(--muted)", fontWeight: 700 }}>{T("Analysed on", "Analysé le")}</span>
                                <span style={{ fontWeight: 700, color: "var(--text)" }}>
                                  {new Date(sel.cwv.gatheredAt).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Passed checks — premium only */}
                      {!isFreeLocked && sel.seoPassed.length > 0 && (
                        <div className="seoDetailSection">
                          <div className="seoDetailSectionHead">
                            <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <span className="seoPulseDot" />
                              {T("Passed checks", "Points validés")}
                            </span>
                            <span className="badge good" style={{ fontSize: 13, padding: "3px 10px", fontWeight: 800 }}>{sel.seoPassed.length}</span>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px 16px", marginTop: 12 }}>
                            {sel.seoPassed.map((item, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", flexShrink: 0, marginTop: 5, display: "inline-block" }} />
                                <span>{translatePassedItem(item, lang)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>{/* end seoDetailScroll */}

                    {/* Footer conclusion + export */}
                    <div style={{
                      padding: "10px 18px",
                      borderTop: "1px solid var(--line)",
                      background: "var(--surface-soft)",
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={statusAccent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                      </svg>
                      <span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, flex: 1 }}>
                        {sel.status === "critical" && T(
                          `${sel.seoIssues.length} issue${sel.seoIssues.length > 1 ? "s" : ""} detected — immediate action recommended to recover search visibility.`,
                          `${sel.seoIssues.length} problème${sel.seoIssues.length > 1 ? "s" : ""} détecté${sel.seoIssues.length > 1 ? "s" : ""} — une intervention rapide est recommandée pour récupérer la visibilité.`
                        )}
                        {sel.status === "moderate" && T(
                          `${sel.seoIssues.length} improvement${sel.seoIssues.length > 1 ? "s" : ""} identified — fixing these would meaningfully boost organic ranking.`,
                          `${sel.seoIssues.length} amélioration${sel.seoIssues.length > 1 ? "s" : ""} identifiée${sel.seoIssues.length > 1 ? "s" : ""} — les corriger aurait un impact mesurable sur le référencement.`
                        )}
                        {sel.status === "good" && T(
                          `Site is well-optimised${sel.seoIssues.length > 0 ? ` — ${sel.seoIssues.length} minor point${sel.seoIssues.length > 1 ? "s" : ""} left to address` : ""}.`,
                          `Site bien optimisé${sel.seoIssues.length > 0 ? ` — ${sel.seoIssues.length} point${sel.seoIssues.length > 1 ? "s" : ""} mineur${sel.seoIssues.length > 1 ? "s" : ""} restant${sel.seoIssues.length > 1 ? "s" : ""}` : ""}.`
                        )}
                      </span>
                      {!isFreeLocked && <button
                        className="btnExportCsv btn small"
                        onClick={() => void exportSeoAudit(sel.lead, sel.id)}
                        disabled={exportingCsv}
                        title={T("Export this SEO audit as CSV", "Exporter cet audit SEO en CSV")}
                        style={{ flexShrink: 0, fontSize: 12, padding: "5px 11px", gap: 5 }}
                      >
                        {exportingCsv ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        )}
                        {T("Export CSV", "Exporter CSV")}
                      </button>}
                    </div>
                  </article>
                  ); })()}


                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
