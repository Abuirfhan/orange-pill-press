'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import dynamic from 'next/dynamic'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

const CATEGORIES = [
  'Bitcoin', 'Nostr', 'Austrian economics',
  'Fiat & Debt', 'Fiat & War', 'Fiat',
  'Bitcoin & self-custody', 'Genesis block',
]

function slugify(text: string) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function mdToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .split('\n\n')
    .map(block => {
      if (block.match(/^<(h[1-3]|ul|blockquote)/)) return block
      if (block.trim() === '') return ''
      return `<p>${block.replace(/\n/g, ' ')}</p>`
    })
    .join('\n')
}

export default function NewArticle() {
  const router = useRouter()
  const [title, setTitle]         = useState('')
  const [slug, setSlug]           = useState('')
  const [excerpt, setExcerpt]     = useState('')
  const [content, setContent]     = useState('')
  const [category, setCategory]   = useState('Bitcoin')
  const [featuredImg, setFeaturedImg] = useState('')
  const [readTime, setReadTime]   = useState(5)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)

  useEffect(() => {
    if (localStorage.getItem('admin_auth') !== 'true') {
      router.push('/admin')
    }
  }, [router])

  useEffect(() => {
    if (title) setSlug(slugify(title))
    // Auto calculate read time
    const words = content.split(' ').length
    setReadTime(Math.max(1, Math.ceil(words / 200)))
  }, [title, content])

  const handlePublish = async () => {
    if (!title || !content || !excerpt) {
      alert('Please fill in title, excerpt, and content')
      return
    }
    setSaving(true)
    const html = mdToHtml(content)
    const { error } = await supabase.from('articles').insert({
      title,
      slug,
      excerpt,
      content: html,
      category,
      featured_image: featuredImg || null,
      read_time_mins: readTime,
      published_at: new Date().toISOString(),
    })
    setSaving(false)
    if (error) {
      alert('Error: ' + error.message)
    } else {
      setSaved(true)
      setTimeout(() => router.push('/admin/posts'), 1500)
    }
  }

  const inputStyle = {
    width: '100%', background: 'var(--bg3)',
    border: '1px solid var(--border)', borderRadius: '2px',
    color: 'var(--white)', fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.9rem', padding: '0.75rem 1rem', outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.7rem', color: 'var(--muted)',
    letterSpacing: '0.1em', textTransform: 'uppercase' as const,
    display: 'block', marginBottom: '0.5rem',
  }

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem', background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 900, color: 'var(--white)' }}>
            New Article
          </h1>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
            Write in Markdown — renders to HTML automatically
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/posts')}
          style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '2px', color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.8rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          ← Back
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Title */}
        <div>
          <label style={labelStyle}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Article title..."
            style={{ ...inputStyle, fontSize: '1.2rem', fontFamily: "'Playfair Display', serif" }}
          />
        </div>

        {/* Slug */}
        <div>
          <label style={labelStyle}>Slug (auto-generated)</label>
          <input
            type="text"
            value={slug}
            onChange={e => setSlug(e.target.value)}
            style={{ ...inputStyle, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.8rem' }}
          />
        </div>

        {/* Excerpt */}
        <div>
          <label style={labelStyle}>Excerpt * (shown on homepage)</label>
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            placeholder="A short description of the article..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Category & Read Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ ...inputStyle, height: '44px' }}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Read Time (mins) — auto</label>
            <input
              type="number"
              value={readTime}
              onChange={e => setReadTime(parseInt(e.target.value))}
              style={{ ...inputStyle, height: '44px' }}
            />
          </div>
        </div>

        {/* Featured Image */}
        <div>
          <label style={labelStyle}>Featured Image URL</label>
          <input
            type="text"
            value={featuredImg}
            onChange={e => setFeaturedImg(e.target.value)}
            placeholder="https://www.orangepillpress.org/wp-content/uploads/..."
            style={inputStyle}
          />
          {featuredImg && (
            <img
              src={featuredImg}
              alt="Preview"
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginTop: '0.75rem', border: '1px solid var(--border)' }}
            />
          )}
        </div>

        {/* Content Editor */}
        <div>
          <label style={labelStyle}>Content * (Markdown)</label>
          <div data-color-mode="dark">
            <MDEditor
              value={content}
              onChange={v => setContent(v || '')}
              height={500}
              preview="live"
            />
          </div>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
            {content.split(' ').length} words · ~{readTime} min read
          </p>
        </div>

        {/* Publish Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          {saved && (
            <p style={{ color: '#4ade80', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.8rem', alignSelf: 'center' }}>
              ✓ Published! Redirecting...
            </p>
          )}
          <button
            onClick={handlePublish}
            disabled={saving}
            style={{
              background: saving ? 'var(--bg3)' : 'var(--gold)',
              border: 'none', borderRadius: '2px',
              color: saving ? 'var(--muted)' : '#000',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.9rem', fontWeight: 600,
              padding: '0.75rem 2.5rem', cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Publishing...' : '⚡ Publish Article'}
          </button>
        </div>

      </div>
    </main>
  )
}