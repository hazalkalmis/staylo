'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const HOTELS = [
  { id: '1', name: 'Hotel Casa Bonay', area: 'Eixample', price: 178, bScore: 8.8, reviews: 1842, scores: { safety: 9.1, quiet: 8.8, family: 8.5, value: 7.8, walkability: 9.4, cleanliness: 9.6 }, summary: 'Quiet rooms, helpful staff, excellent walkability to main attractions.' },
  { id: '2', name: 'Praktik Bakery', area: 'Eixample', price: 148, bScore: 8.5, reviews: 956, scores: { safety: 8.8, quiet: 8.2, family: 8.0, value: 9.1, walkability: 8.9, cleanliness: 9.0 }, summary: 'Great value, family-friendly, popular bakery on ground floor.' },
  { id: '3', name: 'Hotel Brummell', area: 'Poble-sec', price: 164, bScore: 8.1, reviews: 612, scores: { safety: 7.5, quiet: 8.0, family: 6.5, value: 8.2, walkability: 7.8, cleanliness: 8.5 }, summary: 'Stylish boutique hotel, slightly further from main attractions.' },
]

const BG = ['linear-gradient(135deg,#D9EAE2,#8FB8A8)', 'linear-gradient(135deg,#F5E0B0,#E8B14F)', 'linear-gradient(135deg,#D9EAE2,#5A8C7A)']

function Badge({ s, tier, lg }: { s: number; tier: string; lg?: boolean }) {
  const bg = tier === 'good' ? '#4F9E6A' : tier === 'warn' ? '#D4A23A' : '#C5604E'
  const c = tier === 'warn' ? '#3A2C00' : '#fff'
  const d = lg ? 64 : 52
  return <div style={{ width: d, height: d, background: bg, color: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: lg ? 22 : 18, fontWeight: 500, flexShrink: 0 }}>{s}</div>
}

function Page() {
  const sp = useSearchParams()
  const q = sp.get('q') || ''
  const raw = sp.get('data')
  let w: Record<string, number> = { safety: 20, quiet: 20, family: 10, value: 25, walkability: 15, cleanliness: 10 }
  try { if (raw) { const f = JSON.parse(decodeURIComponent(raw)); if (f.weights) w = f.weights } } catch (e) { w = w }

  const scored = HOTELS.map(h => {
    const tot = Object.values(w).reduce((a, b) => a + b, 0)
    const ws = tot === 0 ? 0 : Math.round(Object.entries(h.scores).reduce((a, [k, v]) => a + v * (w[k] || 0) / tot, 0) * 10) / 10
    const tier = ws >= 8.5 ? 'good' : ws >= 7 ? 'warn' : 'bad'
    return { ...h, ws, tier }
  }).sort((a, b) => b.ws - a.ws)

  return (
    <main style={{ minHeight: '100vh', background: '#FAF7F2' }}>
      <nav style={{ borderBottom: '1px solid #E8E2D6', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
        <a href="/search"><img src="/logo.png" alt="Staylo" style={{ height: 40 }} /></a>
        <span style={{ fontSize: 13, color: '#8A8275' }}>{scored.length} hotels ranked</span>
        <a href="/search" style={{ fontSize: 13, color: '#8A8275', textDecoration: 'none' }}>New search</a>
      </nav>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <p style={{ fontSize: 13, color: '#8A8275', marginBottom: 4 }}>Results for</p>
        <p style={{ fontSize: 20, fontWeight: 500, color: '#2F271E', marginBottom: 32 }}>"{q}"</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {scored.map((h, i) => (
            <div key={h.id} style={{ background: '#fff', border: '1px solid #E8E2D6', overflow: 'hidden' }}>
              <div style={{ display: 'flex' }}>
                <div style={{ width: 140, minHeight: 120, flexShrink: 0, background: BG[i % BG.length] }} />
                <div style={{ flex: 1, padding: '20px 20px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: '#8A8275', background: '#FAF7F2', padding: '2px 6px', border: '1px solid #E8E2D6' }}>#{i + 1}</span>
                        <h3 style={{ fontSize: 16, fontWeight: 500, color: '#2F271E', margin: 0 }}>{h.name}</h3>
                      </div>
                      <p style={{ fontSize: 12, color: '#8A8275', margin: 0 }}>{h.area} · {h.reviews.toLocaleString()} reviews</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ textAlign: 'center' }}>
                        <Badge s={h.ws} tier={h.tier} lg />
                        <p style={{ fontSize: 9, color: '#8A8275', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Staylo</p>
                      </div>
                      <div style={{ textAlign: 'center', paddingTop: 8 }}>
                        <div style={{ fontSize: 15, fontWeight: 500, color: '#4A3F32', fontFamily: 'monospace' }}>{h.bScore}</div>
                        <p style={{ fontSize: 9, color: '#8A8275', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Booking</p>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: '#8A8275', lineHeight: 1.55, margin: 0 }}>{h.summary}</p>
                </div>
              </div>
              <div style={{ padding: '12px 20px', borderTop: '1px solid #F2EDE2', background: '#FAF7F2' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px 24px' }}>
                  {Object.entries(h.scores).map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: '#8A8275', width: 72, textTransform: 'capitalize', flexShrink: 0 }}>{key}</span>
                      <div style={{ flex: 1, height: 3, background: '#E8E2D6', position: 'relative' }}>
                        <div style={{ position: 'absolute', inset: '0 auto 0 0', background: val >= 8.5 ? '#4F9E6A' : val >= 7 ? '#D4A23A' : '#C5604E', width: `${val * 10}%` }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#4A3F32', width: 24, textAlign: 'right', fontFamily: 'monospace' }}>{val}</span>
                      <span style={{ fontSize: 10, color: '#B8B0A2', width: 28, textAlign: 'right' }}>{w[key] || 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E8E2D6' }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: '#2F271E' }}>€{h.price}<span style={{ fontSize: 12, fontWeight: 400, color: '#8A8275' }}>/night</span></span>
                <a href={`https://www.booking.com/search.html?ss=${encodeURIComponent(h.name)}`} target="_blank" rel="noopener noreferrer" style={{ background: '#5A8C7A', color: '#fff', padding: '8px 18px', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>View on Booking →</a>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: '#B8B0A2', textAlign: 'center', marginTop: 32 }}>Demo data · Real hotel data coming soon</p>
      </div>
    </main>
  )
}

export default function ResultsPage() {
  return <Suspense fallback={<div style={{ minHeight: '100vh', background: '#FAF7F2' }} />}><Page /></Suspense>
}