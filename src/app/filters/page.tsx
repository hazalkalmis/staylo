'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'
import type { CSSProperties } from 'react'

const WEIGHT_LABELS: Record<string, string> = {
  safety: 'Safety',
  quiet: 'Quiet',
  family: 'Family',
  value: 'Value',
  walk: 'Walkability',
  clean: 'Cleanliness',
}

function FiltersContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const raw = searchParams.get('data')
  const query = searchParams.get('q') || ''

  let initialFilters: any = {}
  try {
    initialFilters = raw ? JSON.parse(decodeURIComponent(raw)) : {}
  } catch {
    initialFilters = {}
  }

  const [city, setCity] = useState(initialFilters.city || '')
  const [checkIn, setCheckIn] = useState(initialFilters.checkIn || '')
  const [checkOut, setCheckOut] = useState(initialFilters.checkOut || '')
  const [guests, setGuests] = useState(initialFilters.guests || 2)
  const [budgetMin, setBudgetMin] = useState(initialFilters.budget?.min ?? '')
  const [budgetMax, setBudgetMax] = useState(initialFilters.budget?.max ?? '')
  const [weights, setWeights] = useState<Record<string, number>>(
    initialFilters.weights || { safety: 20, quiet: 20, family: 10, value: 25, walk: 15, clean: 10 }
  )

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
      budget: {
        ...initialFilters.budget,
        min: budgetMin ? Number(budgetMin) : null,
        max: budgetMax ? Number(budgetMax) : null,
      },
      weights,
    }
    router.push(`/results?data=${encodeURIComponent(JSON.stringify(updated))}&q=${encodeURIComponent(query)}`)
  }

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
  const totalOk = totalWeight === 100

  function renderQuery() {
    if (!query) return <span style={{ color: '#B8B0A2' }}>your search</span>
    if (!city) return query
    const idx = query.toLowerCase().indexOf(String(city).toLowerCase())
    if (idx === -1) return query
    const before = query.slice(0, idx)
    const match = query.slice(idx, idx + String(city).length)
    const after = query.slice(idx + String(city).length)
    return (
      <>
        {before}
        <span style={{ background: '#5A8C7A', color: '#fff', padding: '0 8px', transform: 'rotate(-1deg)', display: 'inline-block' }}>{match}</span>
        {after}
      </>
    )
  }

  const lblStyle: CSSProperties = {
    fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8275', fontWeight: 500,
  }
  const inputStyle: CSSProperties = {
    width: '100%', border: 'none', outline: 'none', fontSize: 18, color: '#2F271E',
    background: 'transparent', marginTop: 8, fontFamily: 'inherit',
  }
  const cellStyle = (i: number): CSSProperties => ({
    padding: '16px 20px',
    borderRight: i % 2 === 0 ? '1px solid #E8E2D6' : 'none',
    borderBottom: i < 4 ? '1px solid #E8E2D6' : 'none',
  })

  return (
    <main style={{ minHeight: '100vh', background: '#EFE9DD' }}>
      <style>{`
        .w-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; outline: none; cursor: pointer; margin: 0; }
        .w-slider::-webkit-slider-runnable-track { height: 6px; background: transparent; }
        .w-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; margin-top: -5px; border-radius: 50%; background: #fff; border: 2px solid #5A8C7A; box-shadow: 0 1px 3px rgba(0,0,0,0.12); cursor: pointer; }
        .w-slider::-moz-range-track { height: 6px; background: transparent; }
        .w-slider::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: #fff; border: 2px solid #5A8C7A; box-shadow: 0 1px 3px rgba(0,0,0,0.12); cursor: pointer; }
        .btn-go-x:hover { background: #4C7A6A; }
        .btn-ghost-x:hover { background: #FBF8F2; }
      `}</style>

      <nav style={{ borderBottom: '1px solid #E8E2D6', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
        <a href="/search"><img src="/logo.png" alt="Staylo" style={{ height: 40, width: 'auto' }} /></a>
        <span style={{ fontSize: 13, color: '#8A8275' }}>Step 2 of 3 — Confirm filters</span>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 28px 80px' }}>
        <div style={{ border: '1px solid #E8E2D6', overflow: 'hidden', background: '#fff' }}>

          <div style={{ padding: '40px 56px' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8275', fontWeight: 500 }}>You searched for</div>
            <div style={{ fontSize: 30, fontWeight: 500, color: '#2F271E', margin: '8px 0 0', letterSpacing: '-0.025em' }}>
              {renderQuery()}
            </div>

            <div style={{ marginTop: 32, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8275', fontWeight: 500 }}>Edit your search</div>

            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid #E8E2D6' }}>
              <div style={cellStyle(0)}>
                <div style={lblStyle}>City</div>
                <input value={city} onChange={e => setCity(e.target.value)} style={inputStyle} />
              </div>
              <div style={cellStyle(1)}>
                <div style={lblStyle}>Guests</div>
                <input type="number" value={guests} onChange={e => setGuests(Number(e.target.value))} min={1} max={20} style={inputStyle} />
              </div>
              <div style={cellStyle(2)}>
                <div style={lblStyle}>Check in</div>
                <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} style={inputStyle} />
              </div>
              <div style={cellStyle(3)}>
                <div style={lblStyle}>Check out</div>
                <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} style={inputStyle} />
              </div>
              <div style={cellStyle(4)}>
                <div style={lblStyle}>Min budget (€/night)</div>
                <input type="number" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} placeholder="No min" style={inputStyle} />
              </div>
              <div style={cellStyle(5)}>
                <div style={lblStyle}>Max budget (€/night)</div>
                <input type="number" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} placeholder="No max" style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={{ background: '#D9EAE2', padding: '36px 56px', borderTop: '1px solid #E8E2D6' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A8C7A', fontWeight: 500 }}>How we'll rank hotels</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button onClick={normalizeWeights} style={{ fontSize: 11, color: totalOk ? '#B8B0A2' : '#5A8C7A', background: '#fff', border: `1px solid ${totalOk ? '#D9D0BD' : '#5A8C7A'}`, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Adjust to 100%
                </button>
                <div style={{ fontSize: 12, color: '#fff', background: totalOk ? '#5A8C7A' : '#C5604E', padding: '4px 10px', fontFamily: 'ui-monospace, monospace' }}>
                  Total {totalWeight}%
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              {Object.entries(weights).map(([key, val]) => (
                <div key={key} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 52px', alignItems: 'center', gap: 18, padding: '9px 0' }}>
                  <span style={{ fontSize: 14, color: '#4A3F32' }}>{WEIGHT_LABELS[key] || key}</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={val}
                    onChange={e => updateWeight(key, Number(e.target.value))}
                    className="w-slider"
                    style={{
                      background: `linear-gradient(to right, #5A8C7A 0%, #5A8C7A ${val}%, rgba(90,140,122,0.25) ${val}%, rgba(90,140,122,0.25) 100%)`,
                    }}
                  />
                  <span style={{ fontSize: 14, fontFamily: 'ui-monospace, monospace', color: '#2F271E', textAlign: 'right' }}>{val}%</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '22px 56px', display: 'flex', gap: 14, borderTop: '1px solid #E8E2D6' }}>
            <a href="/search" className="btn-ghost-x" style={{ background: 'transparent', border: '1px solid #D9D0BD', padding: '14px 22px', fontWeight: 500, fontSize: 14, color: '#4A3F32', textDecoration: 'none' }}>
              ← Edit search
            </a>
            <button onClick={handleFind} className="btn-go-x" style={{ flex: 1, background: '#5A8C7A', color: '#fff', border: 'none', padding: 14, fontWeight: 500, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
              Find hotels →
            </button>
          </div>

        </div>
      </div>
    </main>
  )
}

export default function FiltersPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#EFE9DD' }} />}>
      <FiltersContent />
    </Suspense>
  )
}