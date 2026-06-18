'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'

function FiltersContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const raw = searchParams.get('data')
  const query = searchParams.get('q') || ''

  let initialFilters: any = {}
  try {
    initialFilters = raw ? JSON.parse(decodeURIComponent(raw)) : {}
  } catch { initialFilters = {} }

  const [city, setCity] = useState(initialFilters.city || '')
  const [checkIn, setCheckIn] = useState(initialFilters.checkIn || '')
  const [checkOut, setCheckOut] = useState(initialFilters.checkOut || '')
  const [guests, setGuests] = useState(initialFilters.guests || 2)
  const [budgetMax, setBudgetMax] = useState(initialFilters.budget?.max || '')
  const [weights, setWeights] = useState<Record<string, number>>(initialFilters.weights || {
    safety: 20, quiet: 20, family: 10, value: 25, walkability: 15, cleanliness: 10
  })

  function updateWeight(key: string, val: number) {
  setWeights(prev => ({ ...prev, [key]: val }))
}

function normalizeWeights() {
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  if (total === 0) return
  const normalized: Record<string, number> = {}
  const keys = Object.keys(weights)
  let remaining = 100
  keys.forEach((k, i) => {
    if (i === keys.length - 1) {
      normalized[k] = remaining
    } else {
      normalized[k] = Math.round((weights[k] / total) * 100)
      remaining -= normalized[k]
    }
  })
  setWeights(normalized)
}

  function handleFind() {
    const updated = {
      ...initialFilters,
      city,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      guests: Number(guests),
      budget: { ...initialFilters.budget, max: budgetMax ? Number(budgetMax) : null },
      weights,
    }
    router.push(`/results?data=${encodeURIComponent(JSON.stringify(updated))}&q=${encodeURIComponent(query)}`)
  }

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)

  return (
    <main style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ borderBottom: '1px solid #E8E2D6', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
        <a href="/search"><img src="/logo.png" alt="Staylo" style={{ height: '40px', width: 'auto' }} /></a>
        <span style={{ fontSize: '13px', color: '#8A8275' }}>Step 2 of 3 — Confirm filters</span>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px', width: '100%' }}>

        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#8A8275', textTransform: 'uppercase', marginBottom: '8px' }}>You searched for</p>
          <p style={{ fontSize: '18px', color: '#2F271E', fontStyle: 'italic' }}>"{query}"</p>
        </div>

        {/* EDITABLE FILTERS */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#8A8275', textTransform: 'uppercase', marginBottom: '16px' }}>Edit your search</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            
            <div style={{ background: '#fff', border: '1px solid #E8E2D6', padding: '16px' }}>
              <p style={{ fontSize: '11px', color: '#8A8275', marginBottom: '6px' }}>CITY</p>
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '15px', fontWeight: 500, color: '#2F271E', background: 'transparent' }}
              />
            </div>

            <div style={{ background: '#fff', border: '1px solid #E8E2D6', padding: '16px' }}>
              <p style={{ fontSize: '11px', color: '#8A8275', marginBottom: '6px' }}>GUESTS</p>
              <input
                type="number"
                value={guests}
                onChange={e => setGuests(Number(e.target.value))}
                min={1} max={20}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '15px', fontWeight: 500, color: '#2F271E', background: 'transparent' }}
              />
            </div>

            <div style={{ background: '#fff', border: '1px solid #E8E2D6', padding: '16px' }}>
              <p style={{ fontSize: '11px', color: '#8A8275', marginBottom: '6px' }}>CHECK IN</p>
              <input
                type="date"
                value={checkIn}
                onChange={e => setCheckIn(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '15px', fontWeight: 500, color: '#2F271E', background: 'transparent' }}
              />
            </div>

            <div style={{ background: '#fff', border: '1px solid #E8E2D6', padding: '16px' }}>
              <p style={{ fontSize: '11px', color: '#8A8275', marginBottom: '6px' }}>CHECK OUT</p>
              <input
                type="date"
                value={checkOut}
                onChange={e => setCheckOut(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '15px', fontWeight: 500, color: '#2F271E', background: 'transparent' }}
              />
            </div>

            <div style={{ background: '#fff', border: '1px solid #E8E2D6', padding: '16px', gridColumn: 'span 2' }}>
              <p style={{ fontSize: '11px', color: '#8A8275', marginBottom: '6px' }}>MAX BUDGET (€/night)</p>
              <input
                type="number"
                value={budgetMax}
                onChange={e => setBudgetMax(e.target.value)}
                placeholder="No limit"
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '15px', fontWeight: 500, color: '#2F271E', background: 'transparent' }}
              />
            </div>
          </div>
        </div>

        {/* WEIGHTS */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#8A8275', textTransform: 'uppercase' }}>How we'll rank hotels</p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
  <span style={{ 
    fontSize: '13px', 
    fontWeight: totalWeight !== 100 ? 700 : 400,
    color: totalWeight === 100 ? '#4F9E6A' : '#C5604E' 
  }}>
    Total: {totalWeight}%
  </span>
  {totalWeight !== 100 && (
    <button onClick={normalizeWeights} style={{
      fontSize: '11px', color: '#5A8C7A', background: 'none', border: '1px solid #5A8C7A',
      padding: '2px 8px', cursor: 'pointer'
    }}>
      Normalize to 100%
    </button>
  )}
</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #E8E2D6', padding: '24px' }}>
            {Object.entries(weights).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <span style={{ width: '100px', fontSize: '13px', color: '#4A3F32', textTransform: 'capitalize' }}>{key}</span>
                <input
                  type="range"
                  min={0} max={100}
                  value={val}
                  onChange={e => updateWeight(key, Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#5A8C7A' }}
                />
                <span style={{ fontSize: '12px', color: '#8A8275', width: '32px', textAlign: 'right' }}>{val}%</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <a href="/search" style={{ padding: '12px 24px', border: '1px solid #E8E2D6', fontSize: '14px', color: '#4A3F32', textDecoration: 'none' }}>
            ← Edit search
          </a>
          <button
            onClick={handleFind}
            style={{ flex: 1, padding: '12px 24px', background: '#2F271E', color: '#FAF7F2', border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
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
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#FAF7F2' }} />}>
      <FiltersContent />
    </Suspense>
  )
}