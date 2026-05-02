import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import type { BlogPost } from "@/lib/api";

const API = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com").replace(/\/+$/, "");

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API}/v1/blog/posts/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.post || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found | seoprospector" };
  return {
    title: `${post.title} | seoprospector Blog`,
    description: post.excerpt || undefined,
    openGraph: post.cover_image ? { images: [post.cover_image] } : undefined,
  };
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <div className="blog-page">
      <MarketingNav />
      <main className="blog-main">

        <div className="blog-hero blog-article-hero">
          <div className="container blog-article-hero__inner">
            <div className="blog-article-hero__text">
              <a href="/blog" className="blog-article__back">← Back to Blog</a>
              {post.tags && post.tags.length > 0 && (
                <div className="blog-card__tags" style={{ marginBottom: 16 }}>
                  {post.tags.map(t => <span key={t} className="blog-card__tag">{t}</span>)}
                </div>
              )}
              <h1 className="blog-article__title">{post.title}</h1>
              {post.excerpt && <p className="blog-article__excerpt">{post.excerpt}</p>}
              <div className="blog-article__meta">
                <span>{post.author_name}</span>
                <span className="blog-card__sep">·</span>
                <span>{formatDate(post.published_at)}</span>
              </div>
            </div>
            {post.cover_image && (
              <div className="blog-article-hero__cover">
                <img src={post.cover_image} alt={post.title} />
              </div>
            )}
          </div>
        </div>

        <div className="blog-body">
          <div className="container">
            <article className="blog-article">
              {post.content && (
                <div
                  className="blog-article__content"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              )}

              <footer className="blog-article__footer">
                <a href="/blog" className="blog-article__back-bottom">← Back to Blog</a>
              </footer>
            </article>
          </div>
        </div>

      </main>
      <MarketingFooter />
    </div>
  );
}
