'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArticleFormValues, CATEGORIES, countWords, estimateReadTime, slugify } from '@/lib/article-format'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface ArticleEditorProps {
  mode: 'create' | 'edit'
  initialValues: ArticleFormValues
  saving: boolean
  saved: boolean
  onSubmit: (values: ArticleFormValues) => Promise<void>
}

export default function ArticleEditor({
  mode,
  initialValues,
  saving,
  saved,
  onSubmit,
}: ArticleEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialValues.title)
  const [slug, setSlug] = useState(initialValues.slug)
  const [excerpt, setExcerpt] = useState(initialValues.excerpt)
  const [content, setContent] = useState(initialValues.content)
  const [category, setCategory] = useState(initialValues.category)
  const [featuredImg, setFeaturedImg] = useState(initialValues.featuredImg)
  const [readTime, setReadTime] = useState(initialValues.readTime)
  const [slugEdited, setSlugEdited] = useState(mode === 'edit')

  useEffect(() => {
    setTitle(initialValues.title)
    setSlug(initialValues.slug)
    setExcerpt(initialValues.excerpt)
    setContent(initialValues.content)
    setCategory(initialValues.category)
    setFeaturedImg(initialValues.featuredImg)
    setReadTime(initialValues.readTime)
    setSlugEdited(mode === 'edit' && initialValues.slug.length > 0)
  }, [initialValues, mode])

  useEffect(() => {
    if (!slugEdited) {
      setSlug(slugify(title))
    }
  }, [title, slugEdited])

  useEffect(() => {
    setReadTime(estimateReadTime(content))
  }, [content])

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

  const actionLabel = mode === 'create' ? 'Publish Article' : 'Save Changes'
  const savingLabel = mode === 'create' ? 'Publishing...' : 'Saving...'
  const savedLabel = mode === 'create' ? 'Published! Redirecting...' : 'Saved! Redirecting...'
  const heading = mode === 'create' ? 'New Article' : 'Edit Article'

  const handleSubmit = async () => {
    if (!title || !content || !excerpt) {
      alert('Please fill in title, excerpt, and content')
      return
    }

    await onSubmit({
      title,
      slug,
      excerpt,
      content,
      category,
      featuredImg,
      readTime,
    })
  }

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem', background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 900, color: 'var(--white)' }}>
            {heading}
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

        <div>
          <label style={labelStyle}>Slug</label>
          <input
            type="text"
            value={slug}
            onChange={e => {
              setSlugEdited(true)
              setSlug(e.target.value)
            }}
            style={{ ...inputStyle, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.8rem' }}
          />
        </div>

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
              onChange={e => setReadTime(parseInt(e.target.value, 10) || 1)}
              style={{ ...inputStyle, height: '44px' }}
            />
          </div>
        </div>

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
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={featuredImg}
              alt="Preview"
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginTop: '0.75rem', border: '1px solid var(--border)' }}
            />
          )}
        </div>

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
            {countWords(content)} words · ~{readTime} min read
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          {saved && (
            <p style={{ color: '#4ade80', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.8rem', alignSelf: 'center' }}>
              ✓ {savedLabel}
            </p>
          )}
          <button
            onClick={handleSubmit}
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
            {saving ? savingLabel : `⚡ ${actionLabel}`}
          </button>
        </div>
      </div>
    </main>
  )
}
