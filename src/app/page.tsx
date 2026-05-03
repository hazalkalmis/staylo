export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* NAV */}
      <nav style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 16px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface)',
      }}>
        <img 
  src="/logo.png" 
  alt="Staylo" 
  style={{ height: '48px', width: 'auto', marginLeft: '-4px' }}
/>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="#how" style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'none' }}>How it works</a>
          <a href="#score" style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'none' }}>The score</a>
          <a href="#faq" style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'none' }}>FAQ</a>
          <a href="/search" style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--bg)',
            background: 'var(--ink-strong)',
            padding: '8px 16px',
            textDecoration: 'none',
          }}>
            Try Staylo →
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 120px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '24px', textTransform: 'uppercase' }}>
          AI-powered hotel search · 1.2M+ properties
        </p>

        <h1 style={{
          fontSize: 'clamp(48px, 7vw, 80px)',
          fontWeight: 500,
          letterSpacing: '-0.04em',
          lineHeight: 1.02,
          color: 'var(--ink-strong)',
          marginBottom: '8px',
        }}>
          One search. Every hotel.
        </h1>
        <h1 style={{
          fontSize: 'clamp(48px, 7vw, 80px)',
          fontWeight: 500,
          letterSpacing: '-0.04em',
          lineHeight: 1.02,
          color: 'var(--bg)',
          background: 'var(--accent-deep)',
          padding: '0 16px 6px',
          display: 'inline-block',
          transform: 'rotate(-1.5deg)',
          marginBottom: '32px',
        }}>
          No guessing.
        </h1>

        <p style={{ fontSize: '18px', color: 'var(--muted)', marginBottom: '48px', maxWidth: '480px', lineHeight: 1.55 }}>
          Describe the stay you want. Staylo reads every review, scores every option, and ranks what fits.
        </p>

        {/* SEARCH BOX */}
        <div style={{
          width: '100%',
          maxWidth: '640px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          padding: '20px 24px',
          boxShadow: '0 30px 70px -40px rgba(74,63,50,0.20)',
          marginBottom: '24px',
        }}>
          <input
            type="text"
            placeholder="Find your perfect stay in Barcelona…"
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              color: 'var(--text)',
              background: 'transparent',
              marginBottom: '16px',
            }}
          />
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Dates flexible</span>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>2 guests</span>
            </div>
            <button style={{
              background: 'var(--ink-strong)',
              color: 'var(--bg)',
              border: 'none',
              padding: '10px 22px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}>
              Search →
            </button>
          </div>
        </div>

        {/* CHIPS */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '48px' }}>
          {[
            'Safe family hotel in Barcelona',
            'Quiet hotel near Eiffel Tower',
            'Rooftop pool in Lisbon under €200',
            'Walkable to old town in Prague',
          ].map((chip) => (
            <button key={chip} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: '9px 14px',
              fontSize: '13px',
              color: 'var(--muted)',
              cursor: 'pointer',
            }}>
              {chip}
            </button>
          ))}
        </div>

        {/* STATS */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--ink-strong)' }}>1.2M+</strong> hotels indexed
          </span>
          <span style={{ color: 'var(--border-strong)' }}>·</span>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--ink-strong)' }}>40M+</strong> reviews analyzed
          </span>
          <span style={{ color: 'var(--border-strong)' }}>·</span>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Books on <strong style={{ color: 'var(--ink-strong)' }}>Booking.com</strong> — same price
          </span>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '24px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>© 2026 Staylo</span>
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
          Inventory via Booking.com — not affiliated with Booking Holdings Inc.
        </span>
      </footer>
    </main>
  )
}