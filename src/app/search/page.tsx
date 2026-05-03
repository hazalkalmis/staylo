'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const EXAMPLES = [
  'Safe family hotel in Barcelona',
  'Quiet hotel near Eiffel Tower',
  'Rooftop pool in Lisbon under €200',
  'Walkable to old town in Prague',
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true)

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      
      // Filtreleri URL'e encode edip filters sayfasına gönder
      const encoded = encodeURIComponent(JSON.stringify(data.filters))
      router.push(`/filters?data=${encoded}&q=${encodeURIComponent(query)}`)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* NAV */}
      <nav style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface)',
      }}>
        <a href="/"><img src="/logo.png" alt="Staylo" style={{ height: '40px', width: 'auto' }} /></a>
      </nav>

      {/* HERO */}
      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: 'clamp(36px, 5vw, 60px)',
          fontWeight: 500,
          letterSpacing: '-0.04em',
          lineHeight: 1.02,
          color: 'var(--ink-strong)',
          marginBottom: '8px',
        }}>
          One search. Every hotel.
        </h1>
        <h1 style={{
          fontSize: 'clamp(36px, 5vw, 60px)',
          fontWeight: 500,
          letterSpacing: '-0.04em',
          lineHeight: 1.02,
          color: 'var(--bg)',
          background: 'var(--accent-deep)',
          padding: '0 14px 4px',
          display: 'inline-block',
          transform: 'rotate(-1.5deg)',
          marginBottom: '40px',
        }}>
          No guessing.
        </h1>

        {/* SEARCH BOX */}
        <div style={{
          width: '100%',
          maxWidth: '640px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          padding: '20px 24px',
          boxShadow: '0 30px 70px -40px rgba(74,63,50,0.20)',
          marginBottom: '20px',
        }}>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch() }}}
            placeholder="Describe the stay you want… e.g. quiet family hotel in Barcelona, mid-June, walkable to old town, around €180"
            rows={3}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              color: 'var(--text)',
              background: 'transparent',
              resize: 'none',
              fontFamily: 'var(--font)',
              lineHeight: 1.55,
            }}
          />
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              style={{
                background: loading ? 'var(--muted)' : 'var(--ink-strong)',
                color: 'var(--bg)',
                border: 'none',
                padding: '10px 22px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Analyzing…' : 'Search →'}
            </button>
          </div>
        </div>

        {/* CHIPS */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setQuery(ex)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '8px 14px',
                fontSize: '13px',
                color: 'var(--muted)',
                cursor: 'pointer',
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}