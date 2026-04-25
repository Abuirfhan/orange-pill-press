'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ArticleEditor from '@/components/admin/ArticleEditor'
import { ArticleFormValues, htmlToMarkdown, mdToHtml } from '@/lib/article-format'
import { supabase } from '@/lib/supabase'

const EMPTY_FORM: ArticleFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'Bitcoin',
  featuredImg: '',
  readTime: 5,
}

interface ArticleRecord {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string | null
  category: string
  featured_image: string | null
  read_time_mins: number
}

export default function EditArticlePage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [articleId, setArticleId] = useState<number | null>(null)
  const [initialValues, setInitialValues] = useState<ArticleFormValues>(EMPTY_FORM)

  useEffect(() => {
    if (localStorage.getItem('admin_auth') !== 'true') {
      router.push('/admin')
      return
    }

    const fetchArticle = async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, slug, excerpt, content, category, featured_image, read_time_mins')
        .eq('slug', params.slug)
        .single<ArticleRecord>()

      if (error || !data) {
        alert('Article not found')
        router.push('/admin/posts')
        return
      }

      setArticleId(data.id)
      setInitialValues({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: htmlToMarkdown(data.content ?? ''),
        category: data.category,
        featuredImg: data.featured_image ?? '',
        readTime: data.read_time_mins,
      })
      setLoading(false)
    }

    fetchArticle()
  }, [params.slug, router])

  const handleSave = async (values: ArticleFormValues) => {
    if (!articleId) return

    setSaving(true)
    const { error } = await supabase
      .from('articles')
      .update({
        title: values.title,
        slug: values.slug,
        excerpt: values.excerpt,
        content: mdToHtml(values.content),
        category: values.category,
        featured_image: values.featuredImg || null,
        read_time_mins: values.readTime,
      })
      .eq('id', articleId)

    setSaving(false)

    if (error) {
      alert('Error: ' + error.message)
      return
    }

    setSaved(true)
    setTimeout(() => router.push('/admin/posts'), 1500)
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <p style={{ color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.8rem' }}>
          Loading article...
        </p>
      </main>
    )
  }

  return (
    <ArticleEditor
      mode="edit"
      initialValues={initialValues}
      saving={saving}
      saved={saved}
      onSubmit={handleSave}
    />
  )
}
