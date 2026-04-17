'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Article {
  id: number
  title: string
  slug: string
  category: string
  published_at: string
}

export default function AdminPosts() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading]   = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (localStorage.getItem('admin_auth') !== 'true') {
      router.push('/admin')
      return
    }
    const fetch = async () => {
      const { data } = await supabase
        .from('articles')
        .select('id, title, slug, category, published_at')
        .order('published_at', { ascending: false })
      if (data) setArticles(data)
      setLoading(false)
    }
    fetch()
  }, [router])

  const deleteArticle = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return
    await supabase.from('articles').delete().eq('id', id)
    setArticles(articles.filter(a => a.id !== id))
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem', background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 900, color: 'var(--white)' }}>
            All Articles
          </h1>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
            {articles.length} articles published
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => router.push('/')}
            style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '2px', color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.8rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            ← View Site
          </button>
          <button
            onClick={() => router.push('/admin/new')}
            style={{ background: 'var(--gold)', border: 'none', borderRadius: '2px', color: '#000', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem 1.5rem', cursor: 'pointer' }}
          >
            + New Article
          </button>
        </div>
      </div>

      {/* Articles Table */}
      <div style={{ border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.8rem' }}>
            Loading...
          </div>
        ) : (
          articles.map((article, i) => (
            <div key={article.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.5rem',
              background: i % 2 === 0 ? 'var(--bg2)' : 'var(--bg3)',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: 'var(--white)', fontSize: '0.95rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {article.title}
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', color: 'var(--gold)' }}>
                    {article.category}
                  </span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)' }}>
                    {fmtDate(article.published_at)}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', flexShrink: 0 }}>
                <button
                  onClick={() => router.push(`/admin/edit/${article.slug}`)}
                  style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '2px', color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', padding: '0.4rem 0.8rem', cursor: 'pointer' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => window.open(`/articles/${article.slug}`, '_blank')}
                  style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '2px', color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', padding: '0.4rem 0.8rem', cursor: 'pointer' }}
                >
                  View
                </button>
                <button
                  onClick={() => deleteArticle(article.id, article.title)}
                  style={{ background: 'transparent', border: '1px solid #ef444444', borderRadius: '2px', color: '#ef4444', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', padding: '0.4rem 0.8rem', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Logout */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={() => { localStorage.removeItem('admin_auth'); router.push('/admin') }}
          style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>

    </main>
  )
}