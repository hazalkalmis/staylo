"use client";

import { useEffect, useState, useCallback } from "react";
import { wireAuthNav } from "@/lib/authNav";

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
  :root{--ink:#03045e;--body:#33506a;--muted:#6f8a9c;--faint:#9fb4c2;--border:#e4edf3;
        --surface-2:#f3f9fc;--ocean:#0077b6;--sky:#90e0ef;--cyan:#00b4d8;--deep:#03457a;}
  *{box-sizing:border-box;}
  html,body{margin:0;padding:0;}
  .sv-page{min-height:100vh;font-family:'Geist',system-ui,sans-serif;color:var(--body);background:#fff;}
  a{color:inherit;text-decoration:none;}
  nav{position:sticky;top:0;z-index:50;background:rgba(255,255,255,0.72);backdrop-filter:blur(12px);
    border-bottom:1px solid rgba(228,237,243,0.8);}
  .nav-row{max-width:1160px;margin:0 auto;padding:16px 40px;display:flex;align-items:center;justify-content:space-between;}
  .logo{display:inline-flex;align-items:center;}
  .logo .w{font-weight:700;letter-spacing:-0.05em;color:var(--ink);font-size:26px;}
  .logo .sq{display:flex;align-items:center;justify-content:center;transform:rotate(-4deg);position:relative;
    overflow:hidden;border-radius:3px;margin-left:0.07em;width:28px;height:28px;}
  .logo .sq .h{position:absolute;top:0;height:100%;width:50%;}
  .logo .sq .h.l{left:0;background:var(--sky);} .logo .sq .h.r{right:0;background:var(--ink);}
  .logo .o{position:absolute;z-index:2;font-weight:700;letter-spacing:-0.05em;line-height:1;
    left:50%;top:50%;transform:translate(-50%,-53%);font-size:22px;color:#fff;}
  .logo .o.oL{clip-path:inset(0 50% 0 0);} .logo .o.oR{clip-path:inset(0 0 0 50%);}
  .nav-right{display:flex;align-items:center;gap:20px;}
  .login{font-size:15px;font-weight:600;color:var(--ink);}
  .nav-right .btn{display:inline-flex;align-items:center;border:1px solid var(--ink);background:var(--ink);color:#fff;
    padding:10px 18px;border-radius:11px;font:600 14px 'Geist',sans-serif;}
  .wrap{max-width:1160px;margin:0 auto;padding:44px 40px 80px;}
  .sv-head h1{font-size:clamp(28px,4vw,42px);font-weight:700;letter-spacing:-0.03em;color:var(--ink);margin:0;}
  .sv-head p{font-size:15px;color:var(--muted);margin:10px 0 0;}
  .list{margin-top:30px;display:flex;flex-direction:column;gap:16px;}
  .fcard{display:grid;grid-template-columns:170px 1fr 200px;background:#fff;border:1px solid var(--border);
    border-radius:16px;overflow:hidden;box-shadow:0 30px 70px -58px rgba(3,4,94,0.5);}
  .fthumb{background-size:cover;background-position:center;min-height:130px;}
  .fmid{padding:20px 24px;display:flex;flex-direction:column;justify-content:center;}
  .fname{font-size:19px;font-weight:600;letter-spacing:-0.02em;color:var(--ink);}
  .fcity{font-size:13px;color:var(--muted);margin-top:5px;}
  .frail{padding:20px 22px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;
    background:linear-gradient(180deg,#f3f9fc,#e9f4fb);border-left:1px solid var(--border);}
  .fbadge{width:60px;height:60px;border-radius:13px;color:#fff;display:flex;align-items:center;justify-content:center;
    font-size:23px;font-weight:700;letter-spacing:-0.03em;}
  .fprice{font-size:18px;font-weight:700;color:var(--ink);}
  .fprice span{font-size:11px;color:var(--muted);font-weight:400;}
  .fbtn{width:100%;text-align:center;border:1px solid var(--ink);background:var(--ink);color:#fff;
    padding:10px;border-radius:11px;font:600 13.5px 'Geist',sans-serif;cursor:pointer;}
  .fbtn:hover{background:#06075f;}
  .fremove{background:none;border:none;color:var(--muted);font-size:12.5px;font-weight:600;cursor:pointer;
    display:inline-flex;align-items:center;gap:5px;padding:4px;transition:color 120ms;}
  .fremove:hover{color:#c0392b;}
  .fremove svg{width:14px;height:14px;}
  .state{margin-top:40px;text-align:center;padding:60px 24px;border:1px dashed var(--border);border-radius:16px;
    background:var(--surface-2);}
  .state p{font-size:15px;color:var(--muted);margin:0 0 18px;}
  .state a.cta{display:inline-flex;border:1px solid var(--ink);background:var(--ink);color:#fff;
    padding:12px 22px;border-radius:11px;font:600 14.5px 'Geist',sans-serif;}
  @media(max-width:760px){.fcard{grid-template-columns:1fr;}.fthumb{min-height:150px;}
    .frail{border-left:none;border-top:1px solid var(--border);flex-direction:row;justify-content:space-between;}}@media(max-width:520px){.nav-row{padding:12px 18px;}.nav-right{gap:11px;}.logo .w{font-size:24px;}.logo .sq{width:26px;height:26px;}.logo .o{font-size:20px;}.login{font-size:14px;white-space:nowrap;}.nav-right .btn{padding:9px 15px;font-size:13.5px;white-space:nowrap;}}`;

type Favorite = {
  hotel_id: string;
  hotel_name: string | null;
  city: string | null;
  country: string | null;
  photo_url: string | null;
  price_amount: number | null;
  price_currency: string | null;
  fit_score: number | null;
};

function fitBg(v: number): string {
  if (v >= 8) return "linear-gradient(150deg,#0096c7,#03457a)";
  if (v >= 6.5) return "linear-gradient(150deg,#00b4d8,#0077b6)";
  if (v >= 5) return "linear-gradient(150deg,#48cae4,#0096c7)";
  return "linear-gradient(150deg,#8ca6b5,#5f7688)";
}
function currencySymbol(c: string | null): string {
  return ({ EUR: "€", USD: "$", GBP: "£", TRY: "₺" } as Record<string, string>)[c || "EUR"] || (c ? c + " " : "€");
}
function safePhoto(url: string | null): string | null {
  return typeof url === "string" && /^https:\/\//.test(url) ? url.replace(/'/g, "%27") : null;
}

export default function SavedPage() {
  const [favorites, setFavorites] = useState<Favorite[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/favorites");
      if (res.status === 401) {
        window.location.href = "/login?next=/saved";
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not load your saved hotels.");
        return;
      }
      setFavorites(Array.isArray(data.favorites) ? data.favorites : []);
    } catch {
      setError("Network error. Please refresh.");
    }
  }, []);

  useEffect(() => {
    wireAuthNav();
    load();
  }, [load]);

  async function remove(hotelId: string) {
    // İyimser UI: önce listeden çıkar, sonra sunucudan sil.
    setFavorites((prev) => (prev ? prev.filter((f) => f.hotel_id !== hotelId) : prev));
    try {
      await fetch(`/api/favorites?hotelId=${encodeURIComponent(hotelId)}`, { method: "DELETE" });
    } catch {
      // hata olursa listeyi yeniden yükle (tutarlılık)
      load();
    }
  }

  function bookingHref(f: Favorite): string {
    const p = new URLSearchParams();
    p.set("hotel", f.hotel_id);
    if (f.hotel_name) p.set("name", f.hotel_name);
    if (f.city) p.set("city", f.city);
    return "/api/redirect?" + p.toString();
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="sv-page">
        <nav>
          <div className="nav-row">
            <a href="/" className="logo">
              <span className="w">stayl</span>
              <span className="sq"><span className="h l"></span><span className="h r"></span>
                <span className="o oL">o</span><span className="o oR">o</span></span>
            </a>
            <div className="nav-right">
              <a href="#" className="login">Log out</a>
              <a href="/search" className="btn">New search</a>
            </div>
          </div>
        </nav>

        <div className="wrap">
          <div className="sv-head">
            <h1>Saved hotels</h1>
            <p>Hotels you favorited, with their Staylo fit score at the time you saved them.</p>
          </div>

          {error && <div className="state"><p>{error}</p></div>}

          {!error && favorites === null && (
            <div className="state"><p>Loading your saved hotels…</p></div>
          )}

          {!error && favorites !== null && favorites.length === 0 && (
            <div className="state">
              <p>No saved hotels yet. Run a search and tap the heart on any result.</p>
              <a className="cta" href="/search">Start a search →</a>
            </div>
          )}

          {!error && favorites !== null && favorites.length > 0 && (
            <div className="list">
              {favorites.map((f) => {
                const photo = safePhoto(f.photo_url);
                const thumbStyle = photo
                  ? { backgroundImage: `url('${photo}')` }
                  : { background: "linear-gradient(135deg,#bee1e6,#90e0ef)" };
                return (
                  <article className="fcard" key={f.hotel_id}>
                    <div className="fthumb" style={thumbStyle}></div>
                    <div className="fmid">
                      <div className="fname">{f.hotel_name || "Hotel"}</div>
                      <div className="fcity">{[f.city, f.country].filter(Boolean).join(", ")}</div>
                    </div>
                    <div className="frail">
                      {typeof f.fit_score === "number" && (
                        <div className="fbadge" style={{ background: fitBg(f.fit_score) }}>
                          {(Math.round(f.fit_score * 10) / 10).toFixed(1)}
                        </div>
                      )}
                      {typeof f.price_amount === "number" && (
                        <div className="fprice">
                          {currencySymbol(f.price_currency)}
                          {Math.round(f.price_amount)}
                          <span> /night</span>
                        </div>
                      )}
                      <a className="fbtn" href={bookingHref(f)} rel="nofollow sponsored">View on Booking</a>
                      <button className="fremove" onClick={() => remove(f.hotel_id)} type="button">
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M6 7h12l-1 13H7L6 7zm3-3h6l1 2H8l1-2z" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
