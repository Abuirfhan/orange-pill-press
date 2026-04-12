'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Article {
  id: number
  title: string
  slug: string
  excerpt: string
  category: string
  read_time_mins: number
  published_at: string
}

interface BitcoinStats {
  btc_price_usd: number
  fee_fastest: number
  tx_count: number
  current_hashrate: number
  block_height: number
  btc_total_mined: number
  btc_remaining: number
  blocks_until_halving: number
}

const fmt = (n: number, d = 0) =>
  n?.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) ?? '—'

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const TAGS: Record<string, string> = {
  'Bitcoin': '#f7931a',
  'Nostr': '#a855f7',
  'Austrian economics': '#3b82f6',
  'Fiat & Debt': '#ef4444',
  'Fiat & War': '#ef4444',
  'Fiat': '#ef4444',
}

function Tag({ cat }: { cat: string }) {
  const color = TAGS[cat] || '#888880'
  return (
    <span style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: '0.65rem',
      color,
      letterSpacing: '0.15em',
      textTransform: 'uppercase' as const,
      border: `1px solid ${color}`,
      padding: '0.25rem 0.6rem',
      borderRadius: '2px',
      display: 'inline-block',
      whiteSpace: 'nowrap' as const,
    }}>{cat}</span>
  )
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [stats, setStats]       = useState<BitcoinStats | null>(null)
  const [email, setEmail]       = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [lightning, setLightning]   = useState(false)
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      const { data: arts } = await supabase
        .from('articles')
        .select('id, title, slug, excerpt, category, read_time_mins, published_at')
        .order('published_at', { ascending: false })

      const { data: btc } = await supabase
        .from('mempool_snapshots')
        .select('btc_price_usd, fee_fastest, tx_count, current_hashrate, block_height, btc_total_mined, btc_remaining, blocks_until_halving')
        .order('recorded_at', { ascending: false })
        .limit(1)

      if (arts) setArticles(arts)
      if (btc && btc.length > 0) setStats(btc[0])
      setLoading(false)
    }
    fetchAll()
    const interval = setInterval(fetchAll, 60000)
    return () => clearInterval(interval)
  }, [])

  const filtered = search
    ? articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()))
    : articles

  const featured = filtered[0]
  const rest      = filtered.slice(1)

  return (
    <>
      {/* ── Nav ── */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 3rem',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        background: 'rgba(10,10,8,0.92)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <a href="/" style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.3rem',
            fontWeight: 900,
            color: 'var(--white)',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
          }}>
            Orange Pill <span style={{ color: 'var(--gold)' }}>Press</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.72rem', color: 'var(--gold)' }}>
              ⚡ soakedtoenail74@walletofsatoshi.com
            </span>
            <button
              onClick={() => setLightning(true)}
              style={{
                background: 'var(--gold)', border: 'none', borderRadius: '2px',
                color: '#000', fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.65rem', fontWeight: 600,
                padding: '0.25rem 0.7rem', cursor: 'pointer',
              }}
            >☕ Buy me a coffee</button>
          </div>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)' }}>
            nostr: npub19p3g90j4p4vps2a5phnk4z3qad8r0q2ezrhhcrq6ltt92nz8cfqse4y3wn
          </span>
        </div>
        <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none' }}>
          {[['#posts', 'Articles'], ['#newsletter', 'Newsletter']].map(([href, label]) => (
            <li key={href}>
              <a href={href} style={{
                color: 'var(--muted)', textDecoration: 'none',
                fontSize: '0.85rem', fontWeight: 500,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                fontFamily: "'IBM Plex Mono', monospace",
              }}>{label}</a>
            </li>
          ))}
          <li>
            <a href="#newsletter" style={{
              background: 'var(--gold)', color: '#000',
              padding: '0.5rem 1.2rem', borderRadius: '2px',
              fontWeight: 500, textDecoration: 'none',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.85rem',
            }}>Subscribe</a>
          </li>
        </ul>
      </nav>

      {/* ── Hero ── */}
      <section className="fade-up" style={{
        padding: '5rem 3rem 4rem',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4rem',
        alignItems: 'center',
      }}>
        <div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.7rem',
            color: 'var(--gold)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
          }}>
            <span style={{ display: 'block', width: '2rem', height: '1px', background: 'var(--gold)' }} />
            Bitcoin & Macro Analysis
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.8rem, 5vw, 4.5rem)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            marginBottom: '1.5rem',
          }}>
            Sound money for an{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>unsound</em>{' '}
            world.
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1rem', fontWeight: 300 }}>
            This is for the person who suspects the financial system is broken but wants to understand <em>why</em> — and what comes next.
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2.5rem', fontWeight: 300 }}>
            No sponsors. No ads. No shilling. Just honest long-form writing on Bitcoin, Austrian economics, Nostr, geopolitics, and the collapse of the old monetary order.
          </p>
          <a href="#posts" style={{
            background: 'var(--gold)', color: '#000',
            padding: '0.85rem 2rem', borderRadius: '2px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.9rem', fontWeight: 500,
            cursor: 'pointer', letterSpacing: '0.05em',
            textDecoration: 'none', display: 'inline-block',
          }}>Read Articles</a>
        </div>

        {/* Bitcoin Ticker */}
        <div style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          padding: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, var(--gold), transparent)',
          }} />
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            ₿ Bitcoin Live
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '2.8rem', fontWeight: 500, color: 'var(--white)', lineHeight: 1, marginBottom: '0.5rem' }}>
            {stats ? `$${fmt(stats.btc_price_usd)}` : 'Loading…'}
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.85rem', color: '#4ade80', marginBottom: '2rem' }}>
            Live from sovereign node
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {stats ? [
              ['Block Height', `#${fmt(stats.block_height)}`],
              ['Next Block Fee', `${stats.fee_fastest} sat/vB`],
              ['Supply', `${fmt(stats.btc_total_mined)} ₿`],
              ['Until Halving', `${fmt(stats.blocks_until_halving)} blocks`],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{label}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.9rem', color: 'var(--white)' }}>{value}</div>
              </div>
            )) : Array(4).fill(0).map((_, i) => (
              <div key={i}>
                <div style={{ height: '0.6rem', background: 'var(--bg3)', borderRadius: '2px', marginBottom: '0.3rem', width: '60%' }} />
                <div style={{ height: '0.9rem', background: 'var(--bg3)', borderRadius: '2px', width: '80%' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

      {/* ── Articles ── */}
      <section id="posts" style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 700 }}>
            Latest Articles{' '}
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 400 }}>
              ({articles.length})
            </span>
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: '2px', padding: '0.5rem 1rem',
                color: 'var(--white)', fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.75rem', outline: 'none', width: '220px',
              }}
            />
          </div>
        </div>

        {/* Featured */}
        {featured && (
          <a href={`/articles/${featured.slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              border: '1px solid var(--border)', borderRadius: '4px',
              overflow: 'hidden', cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{
                background: 'var(--bg3)', minHeight: '300px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
              }}>
                <span style={{ fontSize: '8rem', opacity: 0.08, fontFamily: "'Playfair Display', serif", fontWeight: 900, color: 'var(--gold)', transform: 'rotate(-15deg)' }}>B</span>
                <span style={{ fontSize: '4rem', position: 'relative', zIndex: 1 }}>₿</span>
              </div>
              <div style={{ padding: '2.5rem', background: 'var(--bg2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ marginBottom: '1rem' }}><Tag cat={featured.category} /></div>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.6rem', fontWeight: 700,
                    lineHeight: 1.25, marginBottom: '1rem',
                    color: 'var(--white)',
                  }}>{featured.title}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.7, fontWeight: 300 }}>
                    {featured.excerpt}
                  </p>
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)', marginTop: '1.5rem' }}>
                  {fmtDate(featured.published_at)} · {featured.read_time_mins} min read
                </div>
              </div>
            </div>
          </a>
        )}

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {rest.map(article => (
            <a key={article.id} href={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                border: '1px solid var(--border)', borderRadius: '4px',
                overflow: 'hidden', background: 'var(--bg2)',
                cursor: 'pointer', transition: 'all 0.2s', height: '100%',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                <div style={{ height: '140px', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                  <span style={{ position: 'absolute', fontSize: '5rem', opacity: 0.06, fontFamily: "'Playfair Display', serif", fontWeight: 900, color: 'var(--gold)' }}>₿</span>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ marginBottom: '0.75rem' }}><Tag cat={article.category} /></div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.75rem', color: 'var(--white)' }}>
                    {article.title}
                  </h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.8rem', lineHeight: 1.6, fontWeight: 300, marginBottom: '1rem',
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
                  }}>
                    {article.excerpt}
                  </p>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>
                    {fmtDate(article.published_at)} · {article.read_time_mins} min read
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section id="newsletter" style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '4rem 3rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Stay in the loop.
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 300 }}>
            Get the latest Bitcoin analysis and macro commentary delivered weekly. No spam. Unsubscribe anytime.
          </p>
          {subscribed ? (
            <p style={{ color: '#4ade80', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.9rem' }}>
              ✓ Subscribed. Welcome to the rabbit hole.
            </p>
          ) : (
            <form
              onSubmit={async e => {
                e.preventDefault()
                if (email) {
                  await supabase.from('newsletter').insert({ email, subscribed_at: new Date().toISOString() })
                  setSubscribed(true)
                }
              }}
              style={{ display: 'flex', gap: '0' }}
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  flex: 1, height: '48px',
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRight: 'none', borderRadius: '2px 0 0 2px',
                  color: 'var(--white)', fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.9rem', padding: '0 1rem', outline: 'none',
                }}
              />
              <button type="submit" style={{
                background: 'var(--gold)', border: 'none',
                borderRadius: '0 2px 2px 0', color: '#000',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.9rem', fontWeight: 500,
                padding: '0 2rem', cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}>Submit</button>
            </form>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '1rem' }}>
          Orange Pill <span style={{ color: 'var(--gold)' }}>Press</span>
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>
          © 2026 · Built on truth, backed by math.
        </div>
      </footer>

      {/* ── Lightning Modal ── */}
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