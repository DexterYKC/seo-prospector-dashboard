"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  fetchAdminBlogPosts,
  fetchAdminBlogPost,
  createAdminBlogPost,
  updateAdminBlogPost,
  deleteAdminBlogPost,
  type BlogPost,
} from "@/lib/api";
import { useLang } from "@/contexts/LangContext";
import { tr } from "@/lib/i18n";
import { LangSwitchDark } from "@/components/LangSwitch";

const MOD_TOKEN_KEY = "mod_token";
const MOD_INFO_KEY  = "mod_info";

const EMPTY_FORM = {
  title: "", slug: "", author_name: "", cover_image: "",
  tags: "", excerpt: "", content: "", published: false,
};

export default function ModeratorPage() {
  const router = useRouter();
  const { lang } = useLang();
  const T = (en: string, fr: string) => tr(lang, en, fr);

  const [token,    setToken]    = useState<string | null>(null);
  const [modName,  setModName]  = useState("");
  const [posts,    setPosts]    = useState<BlogPost[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState<BlogPost | null | "new">(null);
  const [form,     setForm]     = useState({ ...EMPTY_FORM });
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error,    setError]    = useState("");

  useEffect(() => {
    const t = localStorage.getItem(MOD_TOKEN_KEY);
    if (!t) { router.replace("/login"); return; }
    setToken(t);
    const info = localStorage.getItem(MOD_INFO_KEY);
    if (info) { try { setModName(JSON.parse(info).name || ""); } catch {} }
  }, [router]);

  const loadPosts = useCallback(async (t: string) => {
    setLoading(true);
    try {
      const res = await fetchAdminBlogPosts(t);
      setPosts(res.posts || []);
    } catch { setError(T("Failed to load articles.", "Impossible de charger les articles.")); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (token) loadPosts(token); }, [token, loadPosts]);

  function logout() {
    localStorage.removeItem(MOD_TOKEN_KEY);
    localStorage.removeItem(MOD_INFO_KEY);
    router.replace("/login");
  }

  function openNew() {
    setForm({ ...EMPTY_FORM });
    setEditing("new");
  }

  async function openEdit(post: BlogPost) {
    if (!token) return;
    try {
      const res = await fetchAdminBlogPost(token, post.id);
      const p = res.post;
      setForm({
        title: p.title || "", slug: p.slug || "",
        author_name: p.author_name || "", cover_image: p.cover_image || "",
        tags: (p.tags || []).join(", "), excerpt: p.excerpt || "",
        content: p.content || "", published: p.published,
      });
      setEditing(p);
    } catch { setError("Impossible de charger l'article."); }
  }

  async function onSave() {
    if (!token) return;
    setSaving(true);
    setError("");
    const payload = {
      title: form.title.trim(), slug: form.slug.trim(),
      author_name: form.author_name.trim(), cover_image: form.cover_image.trim() || null,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      excerpt: form.excerpt.trim() || null, content: form.content.trim() || null,
      published: form.published,
    };
    try {
      if (editing === "new") {
        await createAdminBlogPost(token, payload);
      } else if (editing && typeof editing !== "string") {
        await updateAdminBlogPost(token, (editing as BlogPost).id, payload);
      }
      setEditing(null);
      await loadPosts(token);
    } catch { setError("Échec de la sauvegarde."); }
    finally { setSaving(false); }
  }

  async function onDelete(id: string) {
    if (!token || !confirm(T("Delete this article?", "Supprimer cet article ?"))) return;
    setDeleting(id);
    try {
      await deleteAdminBlogPost(token, id);
      setPosts(p => p.filter(x => x.id !== id));
    } catch { setError("Échec de la suppression."); }
    finally { setDeleting(null); }
  }

  if (!token) return null;

  return (
    <div className="modShell">
      <header className="modHeader">
        <div className="modHeader__brand">
          <span className="modHeader__dot" />
          <strong>{T("Moderator Space", "Espace Modérateur")}</strong>
          {modName && <span className="modHeader__name">· {modName}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <LangSwitchDark style={{ marginRight: 8 }} />
          <button className="modHeader__logout" onClick={logout}>{T("Logout", "Déconnexion")}</button>
        </div>
      </header>

      <main className="modMain">
        <div className="modSection">
          <div className="modSection__head">
            <h2>{T("Blog management", "Gestion du blog")}</h2>
            <button className="btn modBtn--primary" onClick={openNew}>{T("+ New post", "+ Nouvel article")}</button>
          </div>

          {error && <div className="modError">{error}</div>}

          {loading ? (
            <p className="modMuted">{T("Loading…", "Chargement…")}</p>
          ) : posts.length === 0 ? (
            <p className="modMuted">{T("No articles.", "Aucun article.")}</p>
          ) : (
            <table className="modTable">
              <thead>
                <tr>
                  <th>{T("Title", "Titre")}</th>
                  <th>Slug</th>
                  <th>{T("Status", "Statut")}</th>
                  <th>{T("Date", "Date")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id}>
                    <td className="modTable__title">{p.title}</td>
                    <td className="modTable__slug">{p.slug}</td>
                    <td>
                      <span className={`modBadge ${p.published ? "modBadge--published" : "modBadge--draft"}`}>
                        {p.published ? T("Published", "Publié") : T("Draft", "Brouillon")}
                      </span>
                    </td>
                    <td className="modTable__date">
                      {p.published_at ? new Date(p.published_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US") : "—"}
                    </td>
                    <td className="modTable__actions">
                      <button className="modBtn modBtn--edit" onClick={() => openEdit(p)}>{T("Edit", "Éditer")}</button>
                      <button className="modBtn modBtn--delete" onClick={() => onDelete(p.id)} disabled={deleting === p.id}>
                        {deleting === p.id ? "…" : T("Delete", "Supprimer")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {editing !== null && (
        <div className="modModal__overlay" onClick={() => setEditing(null)}>
          <div className="modModal" onClick={e => e.stopPropagation()}>
            <div className="modModal__head">
              <h3>{editing === "new" ? T("New article", "Nouvel article") : T("Edit article", "Éditer l'article")}</h3>
              <button className="modModal__close" onClick={() => setEditing(null)}>✕</button>
            </div>

            <div className="modModal__body">
              <div className="modField">
                <label>{T("Title *", "Titre *")}</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Titre de l'article" />
              </div>
              <div className="modField">
                <label>Slug</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="mon-article-slug" />
              </div>
              <div className="modFieldRow">
                <div className="modField">
                  <label>{T("Author", "Auteur")}</label>
                  <input value={form.author_name} onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))} placeholder="Nom de l'auteur" />
                </div>
                <div className="modField">
                  <label>{T("Tags (comma)", "Tags (virgule)")}</label>
                  <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="seo, linkedin, prospecting" />
                </div>
              </div>
              <div className="modField">
                <label>{T("Cover image URL", "URL de l'image de couverture")}</label>
                <input value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="modField">
                <label>{T("Excerpt", "Résumé")}</label>
                <textarea rows={2} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Courte description visible dans la liste..." />
              </div>
              <div className="modField">
                <label>{T("Content (HTML)", "Contenu (HTML)")}</label>
                <textarea rows={12} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="<p>Contenu HTML de l'article...</p>" />
              </div>
              <label className="modCheckbox">
                <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
                {T("Publish immediately", "Publier immédiatement")}
              </label>
            </div>

            {error && <div className="modError" style={{ margin: "0 24px 8px" }}>{error}</div>}

            <div className="modModal__foot">
              <button className="modBtn" onClick={() => setEditing(null)}>{T("Cancel", "Annuler")}</button>
              <button className="modBtn modBtn--primary" onClick={onSave} disabled={saving || !form.title.trim()}>
                {saving ? T("Saving…", "Sauvegarde…") : T("Save", "Sauvegarder")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
