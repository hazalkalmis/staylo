'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

const HOTELS = [
  { id: '1', name: 'Hotel Casa Bonay', area: 'Eixample', price: 178, bScore: 8.8, gScore: 4.5, reviews: 1842, scores: { safety: 9.1, quiet: 8.8, walk: 9.4, clean: 9.6, value: 7.8, family: 8.5 }, summary: 'Quiet rooms, helpful staff, excellent walkability to main attractions.' },
  { id: '2', name: 'Praktik Bakery', area: 'Eixample', price: 148, bScore: 8.5, gScore: 4.3, reviews: 956, scores: { safety: 8.8, quiet: 8.2, walk: 8.9, clean: 9.0, value: 9.1, family: 8.0 }, summary: 'Great value, family-friendly, popular bakery on ground floor.' },
  { id: '3', name: 'Hotel Brummell', area: 'Poble-sec', price: 164, bScore: 8.1, gScore: 4.1, reviews: 612, scores: { safety: 7.5, quiet: 8.0, walk: 7.8, clean: 8.5, value: 8.2, family: 6.5 }, summary: 'Stylish boutique hotel, slightly further from main attractions.' },
]

const LABELS: Record<string, string> = { safety: 'Safety', quiet: 'Quiet', walk: 'Walk', clean: 'Clean', value: 'Value', family: 'Family' }
const BG = ['linear-gradient(135deg,#C9DDD2,#DDEAE3)', 'linear-gradient(135deg,#F5E0B0,#E8B14F)', 'linear-gradient(135deg,#D9EAE2,#5A8C7A)']

function Tooltip() {
  const [show, setShow] = useState(false)
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ width: 13, height: 13, border: '1px solid rgba(90,140,122,0.5)', borderRadius: '50%', color: '#5A8C7A', fontSize: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'help', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}
      >i</span>
      {show && (
        <span style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: '#2F271E', color: '#FAF7F2', fontSize: 11, padding: '9px 11px', width: 210, textAlign: 'left', zIndex: 20, lineHeight: 1.45, pointerEvents: 'none' }}>
          Staylo score — computed from Google + Booking reviews, weighted by the priorities you chose.
          <span style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', border: '5px solid transparent', borderTopColor: '#2F271E', display: 'block', width: 0, height: 0 }} />
        </span>
      )}
    </span>
  )
}

function Page() {
  const sp = useSearchParams()
  const q = sp.get('q') || ''
  const raw = sp.get('data')
  let w: Record<string, number> = { safety: 5, quiet: 50, walk: 30, clean: 10, value: 5, family: 0 }
  try { if (raw) { const f = JSON.parse(decodeURIComponent(raw)); if (f.weights) w = f.weights } } catch (e) { w = w }

  const scored = HOTELS.map(h => {
    const tot = Object.values(w).reduce((a, b) => a + b, 0)
    const ws = tot === 0 ? 0 : Math.round(Object.entries(h.scores).reduce((a, [k, v]) => a + v * (w[k] || 0) / tot, 0) * 10) / 10
    const tier = ws >= 8.5 ? 'good' : ws >= 7 ? 'warn' : 'bad'
    return { ...h, ws, tier }
  }).sort((a, b) => b.ws - a.ws)

  const badgeBg = (tier: string) => tier === 'good' ? '#4F9E6A' : tier === 'warn' ? '#D4A23A' : '#C5604E'
  const badgeColor = (tier: string) => tier === 'warn' ? '#3A2C00' : '#fff'
  const barColor = (v: number) => v >= 8.5 ? '#4F9E6A' : v >= 7 ? '#D4A23A' : '#C5604E'

  return (
    <main style={{ minHeight: '100vh', background: '#FAF7F2' }}>
      <nav style={{ borderBottom: '1px solid #E8E2D6', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
        <a href="/search"><img src="/logo.png" alt="Staylo" style={{ height: 40 }} /></a>
        <span style={{ fontSize: 13, color: '#8A8275' }}>{scored.length} hotels ranked</span>
        <a href="/search" style={{ fontSize: 13, color: '#8A8275', textDecoration: 'none' }}>New search</a>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <p style={{ fontSize: 13, color: '#8A8275', marginBottom: 4 }}>Results for</p>
        <p style={{ fontSize: 20, fontWeight: 500, color: '#2F271E', marginBottom: 32 }}>"{q}"</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {scored.map((h, i) => (
            <div key={h.id} style={{ background: '#fff', border: '1px solid #E8E2D6', display: 'grid', gridTemplateColumns: '210px 1fr 196px', overflow: 'hidden' }}>

              {/* THUMB */}
              <div style={{ background: BG[i % BG.length], borderRight: '1px solid #E8E2D6', minHeight: 220 }} />

              {/* BODY */}
              <div style={{ padding: '26px 30px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: '#2F271E', border: '1px solid #C5B89A', padding: '3px 9px', fontFamily: 'monospace', fontWeight: 600, background: '#F5F0E8'}}>#{i + 1}</span>
                  <span style={{ fontSize: 23, fontWeight: 500, letterSpacing: '-0.02em', color: '#2F271E' }}>{h.name}</span>
                </div>
                <div style={{ fontSize: 12, color: '#8A8275', marginBottom: 14 }}>{h.area} · {h.reviews.toLocaleString()} reviews</div>
                <div style={{ fontSize: 14, color: '#4A3F32', lineHeight: 1.6, maxWidth: 480 }}>{h.summary}</div>

                {/* RIBBON */}
                <div style={{ marginTop: 'auto', paddingTop: 20 }}>
                  <div style={{ display: 'flex', border: '1px solid #E8E2D6' }}>
                    {Object.entries(h.scores).map(([key, val], ri) => (
                      <div key={key} style={{ flex: 1, padding: '11px 14px', borderRight: ri < 5 ? '1px solid #E8E2D6' : 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                        <div style={{ fontSize: 10, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#8A8275', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{LABELS[key]}</span>
                          <span style={{ color: (w[key] || 0) === 0 ? '#D2CBBC' : '#B8B0A2' }}>{w[key] || 0}%</span>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 500, fontFamily: 'monospace', color: val >= 7 ? '#2F271E' : '#D4A23A' }}>{val}</div>
                        <div style={{ height: 3, background: '#E5DECF', position: 'relative' }}>
                          <div style={{ position: 'absolute', inset: '0 auto 0 0', background: barColor(val), width: `${val * 10}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RAIL */}
              <div style={{ background: '#D9EAE2', borderLeft: '1px solid #E8E2D6', padding: '26px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 84, height: 84, background: badgeBg(h.tier), color: badgeColor(h.tier), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 500, letterSpacing: '-0.03em' }}>{h.ws}</div>

                <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A8C7A', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                  STAYLO <Tooltip />
                </div>

                <div style={{ display: 'flex', gap: 16, padding: '13px 0', borderTop: '1px solid rgba(90,140,122,0.22)', borderBottom: '1px solid rgba(90,140,122,0.22)', width: '100%', justifyContent: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 15, height: 15, background: '#1A3A6B', color: '#fff', fontSize: 9, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>B</span>
                    <span style={{ fontSize: 12, color: '#4A3F32', fontFamily: 'monospace', fontWeight: 500 }}>{h.bScore}</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 15, height: 15, background: '#fff', border: '1px solid #E8E2D6', color: '#4A3F32', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>G</span>
                    <span style={{ fontSize: 12, color: '#4A3F32', fontFamily: 'monospace', fontWeight: 500 }}>{h.gScore}</span>
                  </span>
                </div>

                <div style={{ fontSize: 21, fontWeight: 500, color: '#2F271E', letterSpacing: '-0.02em', textAlign: 'center' }}>
                  €{h.price}<span style={{ fontSize: 12, color: '#8A8275', fontWeight: 400 }}> /night</span>
                </div>

                <a href={`https://www.booking.com/search.html?ss=${encodeURIComponent(h.name)}`} target="_blank" rel="noopener noreferrer"
                  style={{ background: '#5A8C7A', color: '#fff', padding: '12px 18px', fontSize: 13, fontWeight: 500, textDecoration: 'none', width: '100%', textAlign: 'center', display: 'block' }}>
                  View on Booking →
                </a>
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