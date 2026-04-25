'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ArticleEditor from '@/components/admin/ArticleEditor'
import { mdToHtml } from '@/lib/article-format'

export default function NewArticle() {
  const router = useRouter()
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)

  useEffect(() => {
    if (localStorage.getItem('admin_auth') !== 'true') {
      router.push('/admin')
    }
  }, [router])

  const handlePublish = async (values: {
    title: string
    slug: string
    excerpt: string
    content: string
    category: string
    featuredImg: string
    readTime: number
  }) => {
    setSaving(true)
    const html = mdToHtml(values.content)
    const { error } = await supabase.from('articles').insert({
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      content: html,
      category: values.category,
      featured_image: values.featuredImg || null,
      read_time_mins: values.readTime,
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

  return (
    <ArticleEditor
      mode="create"
      initialValues={{
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'Bitcoin',
        featuredImg: '',
        readTime: 5,
      }}
      saving={saving}
      saved={saved}
      onSubmit={handlePublish}
    />
  )
}
