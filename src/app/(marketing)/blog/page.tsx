import type { Metadata } from "next";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import type { BlogPost } from "@/lib/api";

export const metadata: Metadata = {
  title: "Blog | seoprospector",
  description: "LinkedIn prospecting tips, SEO strategies, and outreach workflows from the seoprospector team.",
};

const API = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com").replace(/\/+$/, "");

async function getPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API}/v1/blog/posts?limit=50`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.posts || [];
  } catch {
    return [];
  }
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="blog-page">
      <MarketingNav />
      <main className="blog-main">
        <div className="blog-hero">
          <div className="container">
            <p className="detail-kicker">seoprospector · Blog</p>
            <h1 data-i18n="blogTitle">LinkedIn prospecting insights</h1>
            <p className="detail-lead" data-i18n="blogLead">
              Tactics, workflows, and SEO strategies to help you turn LinkedIn activity into pipeline.
            </p>
          </div>
        </div>

        <div className="blog-body">
          <div className="container">
            {posts.length === 0 ? (
              <div className="blog-empty">
                <p data-i18n="blogEmpty">No articles published yet — check back soon.</p>
              </div>
            ) : (
              <div className="blog-grid">
                {posts.map(post => (
                  <a key={post.id} href={`/blog/${encodeURIComponent(post.slug)}`} className="blog-card">
                    {post.cover_image && (
                      <div className="blog-card__cover">
                        <img src={post.cover_image} alt={post.title} loading="lazy" />
                      </div>
                    )}
                    <div className="blog-card__body">
                      {post.tags && post.tags.length > 0 && (
                        <div className="blog-card__tags">
                          {post.tags.slice(0, 3).map(t => (
                            <span key={t} className="blog-card__tag">{t}</span>
                          ))}
                        </div>
                      )}
                      <h2 className="blog-card__title">{post.title}</h2>
                      {post.excerpt && <p className="blog-card__excerpt">{post.excerpt}</p>}
                      <div className="blog-card__meta">
                        <span>{post.author_name}</span>
                        <span className="blog-card__sep">·</span>
                        <span>{formatDate(post.published_at)}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
