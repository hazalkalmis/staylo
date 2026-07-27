"use client";

// ----------------------------------------------------------------------------
// /privacy — Privacy Policy. Diğer sayfalarla tutarlı (login idiomu: cloudy-sky
// gradient, Geist + Instrument Serif, aynı logo). Temel şeffaflık; hukuki belge
// değil. Contact: privacy@staylo.tech (Porkbun'da hazalkalmis@gmail.com'a yönlenir).
// ----------------------------------------------------------------------------

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
  :root{--ink:#03045e;--body:#33506a;--muted:#6f8a9c;--faint:#9fb4c2;--border:#e4edf3;
        --surface-2:#f3f9fc;--ocean:#0077b6;--sky:#90e0ef;--cyan:#00b4d8;}
  *{box-sizing:border-box;}
  .pv-page{min-height:100vh;font-family:'Geist',system-ui,sans-serif;color:var(--body);
    background:linear-gradient(180deg,#cfe9f6 0%,#dcf1fb 40%,#eef9fd 72%,#fff 100%);
    display:flex;flex-direction:column;align-items:center;padding:0 24px;}
  .pv-nav{width:100%;max-width:1160px;display:flex;align-items:center;justify-content:space-between;padding:20px 4px;}
  .logo{display:inline-flex;align-items:center;text-decoration:none;}
  .logo .w{font-weight:700;letter-spacing:-0.05em;color:var(--ink);font-size:26px;}
  .logo .sq{display:flex;align-items:center;justify-content:center;transform:rotate(-4deg);position:relative;
    overflow:hidden;border-radius:3px;margin-left:0.07em;width:28px;height:28px;}
  .logo .sq .h{position:absolute;top:0;height:100%;width:50%;}
  .logo .sq .h.l{left:0;background:var(--sky);} .logo .sq .h.r{right:0;background:var(--ink);}
  .logo .o{position:absolute;z-index:2;font-weight:700;letter-spacing:-0.05em;line-height:1;
    left:50%;top:50%;transform:translate(-50%,-53%);font-size:22px;color:#fff;}
  .logo .o.oL{clip-path:inset(0 50% 0 0);} .logo .o.oR{clip-path:inset(0 0 0 50%);}
  .pv-nav a.back{font-size:14px;font-weight:600;color:var(--ink);text-decoration:none;}
  .pv-nav a.back:hover{color:var(--ocean);}
  .pv-card{background:#fff;border:1px solid var(--border);border-radius:20px;
    box-shadow:0 40px 90px -54px rgba(3,4,94,0.45);padding:46px 44px;width:100%;max-width:760px;margin:4vh 0 56px;}
  .pv-card h1{font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-weight:400;
    font-size:40px;letter-spacing:-0.01em;color:var(--ink);margin:0 0 6px;}
  .pv-updated{font-size:13px;color:var(--faint);margin:0 0 26px;}
  .pv-card h2{font-size:16px;font-weight:700;letter-spacing:-0.01em;color:var(--ink);margin:30px 0 10px;}
  .pv-card p{font-size:15px;line-height:1.62;margin:0 0 12px;}
  .pv-card ul{margin:0 0 12px;padding-left:0;list-style:none;}
  .pv-card li{font-size:15px;line-height:1.6;margin:0 0 12px;padding-left:16px;position:relative;}
  .pv-card li::before{content:"";position:absolute;left:0;top:10px;width:6px;height:6px;border-radius:50%;background:var(--sky);}
  .pv-card li strong{color:var(--ink);font-weight:600;}
  .pv-card em{color:var(--muted);font-style:italic;}
  .pv-card a{color:var(--ocean);text-decoration:underline;font-weight:500;}
  .pv-summary{background:var(--surface-2);border:1px solid var(--border);border-radius:12px;
    padding:14px 18px;font-size:14px;line-height:1.7;color:var(--body);margin:6px 0 12px;}
  .pv-fine{font-size:13.5px;color:var(--muted);line-height:1.6;margin:6px 0 0;}
  .pv-foot{margin-top:30px;padding-top:20px;border-top:1px solid var(--border);font-size:13px;color:var(--faint);}
  @media (max-width:560px){ .pv-card{padding:34px 24px;} .pv-card h1{font-size:32px;} }`;

export default function PrivacyPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pv-page">
        <div className="pv-nav">
          <a href="/" className="logo">
            <span className="w">stayl</span>
            <span className="sq"><span className="h l"></span><span className="h r"></span>
              <span className="o oL">o</span><span className="o oR">o</span></span>
          </a>
          <a href="/" className="back">← Back</a>
        </div>

        <div className="pv-card">
          <h1>Privacy Policy</h1>
          <p className="pv-updated">Last updated: 27 July 2026</p>

          <p>
            Staylo helps you search hotels with transparent, AI-assisted scoring. This page explains
            what data we collect, why, how long we keep it, and your rights. We aim to collect the
            minimum data needed to run the service.
          </p>

          <h2>What we collect &amp; why</h2>
          <ul>
            <li>
              <strong>Account data (if you sign in):</strong> your email address. Sign-in uses Supabase
              Auth; if you set a password it is stored <strong>hashed</strong> by Supabase and we never
              see it. Magic-link sign-in is also available. <em>Purpose: to give you an account, saved
              favorites, and sign-in.</em>
            </li>
            <li>
              <strong>Searches:</strong> your search text, the parsed filters, language, and IP address.
              <em> Purpose: to run and improve the search.</em> Kept 30 days, then automatically deleted.
            </li>
            <li>
              <strong>Favorites:</strong> hotels you save, linked to your account. <em>Purpose: to show
              your saved list.</em> Kept until you remove them (or delete your account).
            </li>
            <li>
              <strong>Click logs:</strong> when you click “View on Booking”, we log the hotel, city,
              destination link, referral/UTM tags, and IP. <em>Purpose: to measure referrals that fund
              the service.</em>
            </li>
            <li>
              <strong>IP address:</strong> used briefly for rate-limiting and abuse prevention.
              Rate-limit records are deleted after 24 hours. (IP also appears in search logs, which
              expire after 30 days, and in click logs.)
            </li>
            <li>
              <strong>Analytics cookies (only with your consent):</strong> if you click <strong>Accept</strong>
              on our cookie banner, we load Google Analytics 4, which sets cookies to measure aggregate
              usage (pages, visits). If you <strong>Decline</strong>, no analytics cookies are set and
              Analytics does not load. You can decline at any time.
            </li>
          </ul>

          <h2>Who processes your data</h2>
          <p>
            We use trusted providers only for what’s needed: <strong>Supabase</strong> (database &amp;
            auth), <strong>Vercel</strong> (hosting), <strong>Google</strong> (hotel data via Places API;
            Analytics if you consent), <strong>liteAPI/Nuitee</strong> (hotel availability),
            <strong> Mapbox</strong> (maps), and <strong>Cloudflare Turnstile</strong> (bot protection).
            We don’t sell your data.
          </p>

          <h2>Your rights (GDPR / KVKK)</h2>
          <p>
            You can access, correct, or delete your data. In the app you can remove any saved favorite at
            any time; search and rate-limit data expire automatically. To delete your account and all
            associated data, email us at <a href="mailto:privacy@staylo.tech">privacy@staylo.tech</a> and
            we’ll process it.
          </p>

          <h2>Data retention summary</h2>
          <div className="pv-summary">
            Searches: 30 days · Rate-limit / IP records: 24 hours · Favorites &amp; account: until you
            delete them · Click logs: retained to measure referrals.
          </div>

          <p className="pv-fine"><strong>Children:</strong> Staylo is not directed at anyone under 16.</p>
          <p className="pv-fine"><strong>Changes:</strong> we may update this policy; the date above reflects the latest version.</p>

          <div className="pv-foot">
            Questions? Contact <a href="mailto:privacy@staylo.tech">privacy@staylo.tech</a>.
          </div>
        </div>
      </div>
    </>
  );
}
