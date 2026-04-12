'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Article {
  id: number
  title: string
  slug: string
  content?: string
  excerpt: string
  category: string
  read_time_mins: number
  published_at: string
  featured_image: string | null
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

const TAGS: Record<string, string> = {
  'Bitcoin': '#f7931a',
  'Nostr': '#a855f7',
  'Austrian economics': '#3b82f6',
  'Fiat & Debt': '#ef4444',
  'Fiat & War': '#ef4444',
  'Fiat': '#ef4444',
  'Bitcoin & self-custody': '#f7931a',
  'Genesis block': '#f7931a',
  'Time': '#22c55e',
  'Power': '#ef4444',
}

export default function ArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [related, setRelated]  = useState<Article[]>([])
  const [loading, setLoading]  = useState(true)
  const [lightning, setLightning] = useState(false)

  useEffect(() => {
    const fetchArticle = async () => {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', params.slug)
        .single()

      if (data) {
        setArticle(data)
        const { data: rel } = await supabase
          .from('articles')
          .select('id, title, slug, excerpt, category, read_time_mins, published_at, featured_image')
          .eq('category', data.category)
          .neq('slug', params.slug)
          .limit(3)
        if (rel) setRelated(rel)
      }
      setLoading(false)
    }
    fetchArticle()
  }, [params.slug])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>🟠</p>
        <p style={{ color: 'var(--gold)', fontFamily: "'IBM Plex Mono', monospace" }}>Loading...</p>
      </div>
    </div>
  )

  if (!article) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>₿</p>
        <p style={{ color: 'var(--white)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Article not found</p>
        <a href="/" style={{ color: 'var(--gold)' }}>← Back to home</a>
      </div>
    </div>
  )

  const tagColor = TAGS[article.category] || '#888880'

  return (
    <>
      <main style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Back link */}
        <div style={{ padding: '1.5rem 3rem 0' }}>
          <a href="/" style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.75rem', color: 'var(--muted)',
            textDecoration: 'none',
          }}>← All Articles</a>
        </div>

        {/* Featured Image Header */}
        {article.featured_image ? (
          <div style={{
            backgroundImage: `url(${article.featured_image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '400px',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '3rem',
            margin: '1.5rem 0 0',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(10,10,8,0.95) 0%, rgba(10,10,8,0.4) 100%)',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.65rem', color: tagColor,
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  border: `1px solid ${tagColor}`,
                  padding: '0.25rem 0.6rem', borderRadius: '2px',
                }}>{article.category}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)' }}>
                  {article.read_time_mins} min read · {fmtDate(article.published_at)}
                </span>
              </div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontWeight: 900, lineHeight: 1.2,
                color: 'var(--white)', maxWidth: '700px',
              }}>{article.title}</h1>
            </div>
          </div>
        ) : (
          <div style={{ padding: '3rem 3rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.65rem', color: tagColor,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                border: `1px solid ${tagColor}`,
                padding: '0.25rem 0.6rem', borderRadius: '2px',
              }}>{article.category}</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)' }}>
                {article.read_time_mins} min read · {fmtDate(article.published_at)}
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 900, lineHeight: 1.2, color: 'var(--white)',
            }}>{article.title}</h1>
          </div>
        )}

        {/* Excerpt */}
        <div style={{ padding: '2rem 3rem 0' }}>
          <p style={{
            borderLeft: '3px solid var(--gold)',
            paddingLeft: '1.5rem',
            color: 'var(--muted)',
            fontSize: '1.1rem',
            lineHeight: 1.7,
            fontStyle: 'italic',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
          }}>{article.excerpt}</p>
        </div>

        <div style={{ margin: '2rem 3rem 0', borderTop: '1px solid var(--border)' }} />

        {/* Article Content */}
        <div
          className="article-content"
          style={{ padding: '2rem 3rem' }}
          dangerouslySetInnerHTML={{ __html: article.content ?? '' }}
        />

        <div style={{ margin: '0 3rem', borderTop: '1px solid var(--border)' }} />

        {/* Lightning Tip */}
        <div style={{
          margin: '3rem',
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚡</p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, color: 'var(--white)', marginBottom: '0.5rem' }}>
            Found this valuable?
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 300 }}>
            Support independent Bitcoin writing with a Lightning tip.
          </p>
          <button
            onClick={() => setLightning(true)}
            style={{
              background: 'var(--gold)', border: 'none', borderRadius: '2px',
              color: '#000', fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.9rem', fontWeight: 600,
              padding: '0.75rem 2rem', cursor: 'pointer',
            }}
          >⚡ Send a tip</button>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.75rem' }}>
            soakedtoenail74@walletofsatoshi.com
          </p>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <div style={{ padding: '0 3rem 4rem' }}>
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.65rem', color: 'var(--gold)',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}>More in {article.category}</p>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {related.map(r => (
                <a key={r.id} href={`/articles/${r.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '1.25rem',
                    background: 'var(--bg2)',
                    transition: 'border-color 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    <h3 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 700, color: 'var(--white)',
                      marginBottom: '0.5rem', fontSize: '1rem',
                    }}>{r.title}</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 300 }}>
                      {r.read_time_mins} min read · {fmtDate(r.published_at)}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Lightning Modal */}
      {lightning && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setLightning(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--gold)', borderRadius: '4px', padding: '2rem', maxWidth: '320px', width: '90%', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setLightning(false)} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', width: '2rem', height: '2rem', borderRadius: '2px', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>⚡ Lightning Tip</div>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=lightning:soakedtoenail74@walletofsatoshi.com" style={{ width: '200px', height: '200px', borderRadius: '4px', marginBottom: '1rem' }} alt="Lightning QR" />
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', color: 'var(--white)', marginBottom: '0.5rem' }}>soakedtoenail74@walletofsatoshi.com</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: 'var(--muted)' }}>Scan with any Lightning wallet</div>
          </div>
        </div>
      )}
    </>
  )
}