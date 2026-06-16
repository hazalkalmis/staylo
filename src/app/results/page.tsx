'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const HOTELS = [
  { id: '1', name: 'Hotel Casa Bonay', area: 'Eixample', price: 178, bScore: 8.8, reviews: 1842, score: 9.2, tier: 'good', summary: 'Quiet rooms, helpful staff, excellent walkability to main attractions.' },
  { id: '2', name: 'Praktik Bakery', area: 'Eixample', price: 148, bScore: 8.5, reviews: 956, score: 8.7, tier: 'good', summary: 'Great value, family-friendly, popular bakery on ground floor.' },
  { id: '3', name: 'Hotel Brummell', area: 'Poble-sec', price: 164, bScore: 8.1, reviews: 612, score: 7.9, tier: 'warn', summary: 'Stylish boutique hotel, slightly further from main attractions.' },
]

function Badge({ score, tier }: { score: number; tier: string }) {
  return (
    <div style={{ width: 52, height: 52, background: tier === 'good' ? '#4F9E6A' : '#D4A23A', color: tier === 'warn' ? '#3A2C00' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 500 }}>
      {score}
    </div>
  )
}

function Content() {
  const p = useSearchParams()
  const q = p.get('q') || ''
  return (
    <main style={{ minHeight: '100vh', background: '#FAF7F2' }}>
      <nav style={{ borderBottom: '1px solid #E8E2D6', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
        <a href="/search"><img src="/logo.png" alt="Staylo" style={{ height: 40 }} /></a>
        <a href="/search" style={{ fontSize: 13, color: '#8A8275', textDecoration: 'none' }}>New search</a>
      </nav>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <p style={{ fontSize: 13, color: '#8A8275', marginBottom: 4 }}>Results for</p>
        <p style={{ fontSize: 20, fontWeight: 500, color: '#2F271E', marginBottom: 24 }}>"{q}"</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {HOTELS.map((h, i) => (
            <div key={h.id} style={{ background: '#fff', border: '1px solid #E8E2D6', padding: 24, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ background: '#D9EAE2', width: 100, height: 80, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: '#2F271E' }}>#{i+1} {h.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#8A8275' }}>{h.area} · {h.reviews.toLocaleString()} reviews · €{h.price}/night</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Badge score={h.score} tier={h.tier} />
                    <p style={{ margin: '4px 0 0', fontSize: 10, color: '#8A8275' }}>Booking {h.bScore}</p>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#8A8275', lineHeight: 1.55, marginBottom: 16 }}>{h.summary}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#8A8275' }}>€{h.price}/night</span>
                  <a href={`https://www.booking.com/search.html?ss=${encodeURIComponent(h.name)}`} target="_blank" rel="noopener noreferrer" style={{ background: '#2F271E', color: '#FAF7F2', padding: '8px 16px', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                    View on Booking →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: '#B8B0A2', textAlign: 'center', marginTop: 32 }}>Demo data — real results coming soon.</p>
      </div>
    </main>
  )
}

export default function ResultsPage() {
  return <Suspense fallback={<div style={{ minHeight: '100vh', background: '#FAF7F2' }} />}><Content /></Suspense>
}