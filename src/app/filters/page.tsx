'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function FiltersContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const raw = searchParams.get('data')
  const query = searchParams.get('q') || ''
  
  let filters: any = null
  try {
    filters = raw ? JSON.parse(decodeURIComponent(raw)) : null
  } catch {
    filters = null
  }

  if (!filters) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>No filters found. <a href="/search" style={{ color: 'var(--accent-deep)' }}>Go back</a></p>
      </main>
    )
  }

  const weights = filters.weights || {}
  const totalWeight = Object.values(weights).reduce((a: any, b: any) => a + b, 0)

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
        <a href="/search"><img src="/logo.png" alt="Staylo" style={{ height: '40px', width: 'auto' }} /></a>
        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Step 2 of 3 — Confirm filters</span>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px', width: '100%' }}>
        
        {/* QUERY */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px' }}>You searched for</p>
          <p style={{ fontSize: '18px', color: 'var(--ink-strong)', fontStyle: 'italic' }}>"{query}"</p>
        </div>

        {/* FILTERS */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '16px' }}>We understood</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {filters.city && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px' }}>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>CITY</p>
                <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--ink-strong)' }}>{filters.city}{filters.country ? `, ${filters.country}` : ''}</p>
              </div>
            )}
            {filters.guests && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px' }}>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>GUESTS</p>
                <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--ink-strong)' }}>{filters.guests} guests</p>
              </div>
            )}
            {filters.checkIn && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px' }}>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>DATES</p>
                <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--ink-strong)' }}>{filters.checkIn} → {filters.checkOut}</p>
              </div>
            )}
            {filters.budget?.max && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px' }}>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>BUDGET</p>
                <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--ink-strong)' }}>up to €{filters.budget.max}/night</p>
              </div>
            )}
            {filters.priorities?.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px', gridColumn: 'span 2' }}>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>PRIORITIES</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {filters.priorities.map((p: string) => (
                    <span key={p} style={{
                      background: 'var(--accent-soft)',
                      color: 'var(--accent-deep)',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}>{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* WEIGHTS */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '16px' }}>How we'll rank hotels</p>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '24px' }}>
            {Object.entries(weights).map(([key, val]: [string, any]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
                <span style={{ width: '100px', fontSize: '13px', color: 'var(--text)', textTransform: 'capitalize' }}>{key}</span>
                <div style={{ flex: 1, height: '4px', background: 'var(--border)', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: '0 auto 0 0', background: 'var(--accent-deep)', width: `${val}%` }} />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--muted)', width: '32px', textAlign: 'right' }}>{val}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <a href="/search" style={{
            padding: '12px 24px',
            border: '1px solid var(--border)',
            fontSize: '14px',
            color: 'var(--text)',
            textDecoration: 'none',
          }}>
            ← Edit search
          </a>
          <button
            onClick={() => router.push(`/results?data=${encodeURIComponent(raw || '')}&q=${encodeURIComponent(query)}`)}
            style={{
              flex: 1,
              padding: '12px 24px',
              background: 'var(--ink-strong)',
              color: 'var(--bg)',
              border: 'none',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Find hotels →
          </button>
        </div>
      </div>
    </main>
  )
}

export default function FiltersPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)' }} />}>
      <FiltersContent />
    </Suspense>
  )
}