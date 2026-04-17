'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      localStorage.setItem('admin_auth', 'true')
      router.push('/admin/posts')
    } else {
      setError('Invalid password')
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontSize: '3rem' }}>🟠</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 900, color: 'var(--white)' }}>
            Admin Panel
          </h1>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
            Orange Pill Press
          </p>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '2rem' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', height: '48px',
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: '2px', color: 'var(--white)',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.9rem', padding: '0 1rem', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {error && (
              <p style={{ color: '#ef4444', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.8rem' }}>{error}</p>
            )}
            <button type="submit" style={{
              background: 'var(--gold)', border: 'none', borderRadius: '2px',
              color: '#000', fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.9rem', fontWeight: 600,
              height: '48px', cursor: 'pointer',
            }}>
              Enter
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}