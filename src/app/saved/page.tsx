"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { wireAuthNav } from "@/lib/authNav";

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');
  :root{--ink:#03045e;--body:#33506a;--muted:#6f8a9c;--faint:#9fb4c2;--border:#e4edf3;
        --surface:#ffffff;--surface-2:#f3f9fc;--ocean:#0077b6;--sky:#90e0ef;--cyan:#00b4d8;}
  *{box-sizing:border-box;}
  html,body{margin:0;padding:0;}
  a{color:inherit;text-decoration:none;}
  /* Bulutlu-gökyüzü sayfa arka planı (saf beyaz değil; diğer sayfalarla tutarlı). */
  .sv-page{min-height:100vh;font-family:'Geist',system-ui,sans-serif;color:var(--body);
    line-height:1.55;-webkit-font-smoothing:antialiased;
    background:linear-gradient(180deg,#cfe9f6 0%,#dcf1fb 34%,#eef9fd 62%,#f4fafd 100%);}
  /* nav */
  nav{position:sticky;top:0;z-index:50;background:rgba(255,255,255,0.72);
      backdrop-filter:blur(12px);border-bottom:1px solid rgba(228,237,243,0.8);}
  .nav-row{max-width:1160px;margin:0 auto;padding:16px 40px;display:flex;align-items:center;justify-content:space-between;}
  .logo{display:inline-flex;align-items:center;}
  .logo .w{font-weight:700;letter-spacing:-0.05em;color:var(--ink);font-size:30px;}
  .logo .sq{display:flex;align-items:center;justify-content:center;transform:rotate(-4deg);position:relative;
    overflow:hidden;border-radius:3px;margin-left:0.07em;width:32px;height:32px;}
  .logo .sq .h{position:absolute;top:0;height:100%;width:50%;}
  .logo .sq .h.l{left:0;background:var(--sky);} .logo .sq .h.r{right:0;background:var(--ink);}
  .logo .o{position:absolute;z-index:2;font-weight:700;letter-spacing:-0.05em;line-height:1;
    left:50%;top:50%;transform:translate(-50%,-53%);font-size:25px;color:#fff;}
  .logo .o.oL{clip-path:inset(0 50% 0 0);} .logo .o.oR{clip-path:inset(0 0 0 50%);}
  .nav-right{display:flex;align-items:center;gap:20px;}
  .login{font-size:15px;font-weight:600;color:var(--ink);cursor:pointer;}
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--ink);
    background:var(--ink);color:#fff;padding:12px 22px;border-radius:11px;
    font:600 14.5px 'Geist',sans-serif;cursor:pointer;transition:background 120ms;}
  .btn:hover{background:#06075f;}
  .wrap{max-width:1160px;margin:0 auto;padding:0 40px;position:relative;z-index:3;}
  /* sky + clouds */
  .skyband{position:relative;overflow:hidden;}
  .cloud-layer{position:absolute;inset:0;pointer-events:none;z-index:1;}
  .cloud{position:absolute;will-change:transform;}
  .cloud svg{display:block;}
  @keyframes drift{from{transform:translateX(-20px);}to{transform:translateX(20px);}}
  /* saved head */
  .shead{padding:48px 0 6px;position:relative;z-index:3;}
  .shead.wrap{padding-left:40px;padding-right:40px;}
  .savedcount{display:inline-block;font-size:13px;font-weight:600;color:var(--ocean);background:rgba(255,255,255,0.7);
    border:1px solid var(--border);border-radius:999px;padding:5px 13px;margin-bottom:16px;}
  .shead h1{font-size:clamp(38px,5vw,60px);font-weight:800;letter-spacing:-0.04em;line-height:1;margin:0;color:var(--ink);}
  .shead p{font-size:16px;color:var(--body);margin:14px 0 0;max-width:620px;}
  /* toolbar */
  .toolbar{position:relative;z-index:3;display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:24px 0 0;}
  .seg{display:inline-flex;background:rgba(255,255,255,0.8);border:1px solid var(--border);border-radius:11px;padding:3px;gap:2px;}
  .seg button{border:none;background:transparent;font:600 13px 'Geist',sans-serif;color:var(--muted);padding:8px 15px;border-radius:8px;cursor:pointer;}
  .seg button.on{background:var(--ink);color:#fff;}
  .cityfilter{display:flex;gap:7px;flex-wrap:wrap;margin-left:auto;}
  .cf{font-size:13px;color:var(--body);background:rgba(255,255,255,0.8);border:1px solid var(--border);border-radius:999px;padding:8px 15px;cursor:pointer;transition:border-color 120ms,color 120ms,background 120ms;}
  .cf.on{border-color:var(--ocean);color:var(--ink);background:#fff;}
  /* grid + cards */
  .grid{position:relative;z-index:3;margin-top:24px;padding-bottom:80px;display:grid;grid-template-columns:1fr 1fr;gap:18px;}
  .gcard{background:#fff;border:1px solid var(--border);border-radius:18px;overflow:hidden;
    box-shadow:0 30px 70px -56px rgba(3,4,94,0.5);display:flex;flex-direction:column;transition:opacity 180ms,transform 180ms;}
  .gphoto{position:relative;height:200px;background-size:cover;background-position:center;}
  .gbadge{position:absolute;top:14px;left:14px;z-index:5;width:56px;height:56px;border-radius:13px;color:#fff;
    display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;letter-spacing:-0.02em;
    box-shadow:0 12px 24px -10px rgba(3,4,94,0.5);}
  .gremove{position:absolute;top:14px;right:14px;z-index:5;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.92);
    border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--ink);
    box-shadow:0 8px 20px -8px rgba(3,4,94,0.5);transition:background 120ms,color 120ms;}
  .gremove:hover{background:#c0392b;color:#fff;} .gremove svg{width:17px;height:17px;}
  .gpricebar{position:absolute;bottom:0;left:0;right:0;z-index:5;padding:26px 16px 12px;
    background:linear-gradient(180deg,rgba(3,4,94,0) 0%,rgba(3,4,94,0.74) 100%);color:#fff;font-size:19px;font-weight:700;letter-spacing:-0.02em;}
  .gpricebar span{font-size:12px;font-weight:400;color:#cfe6f4;}
  .gbody{padding:18px 22px 20px;display:flex;flex-direction:column;flex:1;}
  .gname{font-size:20px;font-weight:600;letter-spacing:-0.02em;color:var(--ink);}
  .gloc{font-size:13.5px;color:var(--muted);margin-top:4px;}
  .gfoot{margin-top:16px;padding-top:14px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:10px;}
  .gsaved{font-size:12px;color:var(--faint);}
  .gfoot .btn{padding:9px 15px;font-size:13px;border-radius:10px;}
  /* states */
  .state{position:relative;z-index:3;margin-top:30px;text-align:center;padding:60px 24px;
    border:1px solid var(--border);border-radius:18px;background:rgba(255,255,255,0.72);backdrop-filter:blur(4px);}
  .state p{font-size:15px;color:var(--muted);margin:0 0 18px;}
  .state a.cta{display:inline-flex;border:1px solid var(--ink);background:var(--ink);color:#fff;
    padding:12px 22px;border-radius:11px;font:600 14.5px 'Geist',sans-serif;}
  @media(max-width:820px){.grid{grid-template-columns:1fr;}.cityfilter{margin-left:0;}}@media(max-width:520px){.nav-row{padding:12px 18px;}.nav-right{gap:11px;}.logo .w{font-size:24px;}.logo .sq{width:26px;height:26px;}.logo .o{font-size:20px;}.login{font-size:14px;white-space:nowrap;}.nav-right .btn{padding:9px 15px;font-size:13.5px;white-space:nowrap;}}`;

type Favorite = {
  hotel_id: string;
  hotel_name: string | null;
  city: string | null;
  country: string | null;
  photo_url: string | null;
  price_amount: number | null;
  price_currency: string | null;
  fit_score: number | null;
  created_at?: string | null;
};

// Yeni tasarımın badge rengi: sürekli mavi skala (koyu = en iyi fit).
function blueScale(v: number): string {
  const stops: [number, number[]][] = [
    [6.5, [125, 211, 232]], [7.4, [72, 202, 228]], [8.2, [0, 180, 216]],
    [8.8, [0, 119, 182]], [9.3, [3, 69, 122]], [9.7, [3, 4, 94]],
  ];
  v = Math.max(stops[0][0], Math.min(stops[stops.length - 1][0], v));
  let a = stops[0], b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (v >= stops[i][0] && v <= stops[i + 1][0]) { a = stops[i]; b = stops[i + 1]; break; }
  }
  const t = (v - a[0]) / ((b[0] - a[0]) || 1);
  const c = a[1].map((x, i) => Math.round(x + (b[1][i] - x) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
function currencySymbol(c: string | null): string {
  return ({ EUR: "€", USD: "$", GBP: "£", TRY: "₺" } as Record<string, string>)[c || "EUR"] || (c ? c + " " : "€");
}
function safePhoto(url: string | null): string | null {
  return typeof url === "string" && /^https:\/\//.test(url) ? url.replace(/'/g, "%27") : null;
}
function savedOn(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return "Saved " + d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ---- Bulut üretimi (diğer sayfalarla aynı; head zone, beyaz bulutlar) ----
let __uid = 0;
function realCloud(w: number, h: number): string {
  const id = "c" + (__uid++);
  const seed = Math.floor(Math.random() * 9000) + 1;
  const col = "rgb(255,255,255)";
  const sh = "rgb(178,199,229)";
  const J = (v: number, a: number) => v + (Math.random() * 2 - 1) * a;
  const Z = (v: number) => v * (0.82 + Math.random() * 0.4);
  const base = [
    [0.32, 0.5, 0.2, 0.18], [0.5, 0.4, 0.245, 0.225], [0.66, 0.49, 0.205, 0.185],
    [0.43, 0.55, 0.16, 0.14], [0.6, 0.56, 0.15, 0.125], [0.25, 0.55, 0.13, 0.115],
    [0.78, 0.55, 0.12, 0.105],
  ];
  const lumps = base.map(([cx, cy, rx, ry]) => [J(cx, 0.035), J(cy, 0.028), Z(rx), Z(ry)]);
  const body = lumps.map(([cx, cy, rx, ry]) =>
    `<ellipse cx="${(w * cx).toFixed(1)}" cy="${(h * cy).toFixed(1)}" rx="${(w * rx).toFixed(1)}" ry="${(h * ry).toFixed(1)}" fill="url(#g${id})"/>`).join("");
  const shade = lumps.map(([cx, cy, rx, ry]) =>
    `<ellipse cx="${(w * (cx + rx * 0.26)).toFixed(1)}" cy="${(h * (cy + ry * 0.46)).toFixed(1)}" rx="${(w * rx * 0.72).toFixed(1)}" ry="${(h * ry * 0.64).toFixed(1)}" fill="url(#s${id})"/>`).join("");
  const dscale = Math.round(h * 0.14);
  const bf = (0.01 + Math.random() * 0.004).toFixed(4);
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="overflow:visible">
    <defs>
      <radialGradient id="g${id}" cx="46%" cy="42%" r="54%">
        <stop offset="0%" stop-color="${col}" stop-opacity="1"/>
        <stop offset="60%" stop-color="${col}" stop-opacity="0.97"/>
        <stop offset="100%" stop-color="${col}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="s${id}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${sh}" stop-opacity="0.5"/>
        <stop offset="55%" stop-color="${sh}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${sh}" stop-opacity="0"/>
      </radialGradient>
      <filter id="t${id}" x="-45%" y="-50%" width="190%" height="210%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="${bf}" numOctaves="5" seed="${seed}" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="${dscale}" xChannelSelector="R" yChannelSelector="G"/>
        <feGaussianBlur stdDeviation="2"/>
      </filter>
    </defs>
    <g filter="url(#t${id})">${body}${shade}</g>
  </svg>`;
}
function paintClouds(el: HTMLElement): void {
  const list = [
    { l: "60%", t: "-2%", w: 460, h: 210, o: 0.95, d: 82 },
    { l: "-5%", t: "24%", w: 340, h: 160, o: 0.8, d: 90 },
    { l: "30%", t: "6%", w: 200, h: 104, o: 0.5, d: 62 },
  ];
  el.innerHTML = list.map((c, i) => {
    const dir = i % 2 ? "reverse" : "normal";
    return `<div class="cloud" style="left:${c.l};top:${c.t};opacity:${c.o};animation:drift ${c.d}s ease-in-out ${dir} infinite alternate;">${realCloud(c.w, c.h)}</div>`;
  }).join("");
}

export default function SavedPage() {
  const [favorites, setFavorites] = useState<Favorite[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<"fit" | "price">("fit");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const cloudRef = useRef<HTMLDivElement>(null);

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
    if (cloudRef.current) paintClouds(cloudRef.current);
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

  // Şehir listesi + savedcount (tüm favorilerden türetilir).
  const cities = useMemo(() => {
    const set = new Set<string>();
    (favorites || []).forEach((f) => { if (f.city) set.add(f.city); });
    return [...set];
  }, [favorites]);

  // Görünen liste: şehir filtresi + sıralama (client-side).
  const shown = useMemo(() => {
    let list = (favorites || []).slice();
    if (cityFilter !== "all") list = list.filter((f) => f.city === cityFilter);
    list.sort((a, b) => {
      if (sortMode === "fit") return (b.fit_score ?? -1) - (a.fit_score ?? -1);
      return (a.price_amount ?? Infinity) - (b.price_amount ?? Infinity);
    });
    return list;
  }, [favorites, cityFilter, sortMode]);

  const total = favorites?.length ?? 0;
  const hasItems = favorites !== null && total > 0;
  const countText = `${total} hotel${total !== 1 ? "s" : ""} saved · ${cities.length} cit${cities.length !== 1 ? "ies" : "y"}`;

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

        <div className="skyband">
          <div className="cloud-layer" ref={cloudRef}></div>
          <div className="shead wrap">
            {hasItems && <span className="savedcount">{countText}</span>}
            <h1>Saved hotels</h1>
            <p>Hotels you favorited, with their Staylo fit score at the time you saved them.</p>
            {hasItems && (
              <div className="toolbar">
                <div className="seg">
                  <button className={sortMode === "fit" ? "on" : ""} onClick={() => setSortMode("fit")} type="button">Best fit</button>
                  <button className={sortMode === "price" ? "on" : ""} onClick={() => setSortMode("price")} type="button">Price</button>
                </div>
                {cities.length > 1 && (
                  <div className="cityfilter">
                    <span className={cityFilter === "all" ? "cf on" : "cf"} onClick={() => setCityFilter("all")}>All</span>
                    {cities.map((c) => (
                      <span key={c} className={cityFilter === c ? "cf on" : "cf"} onClick={() => setCityFilter(c)}>{c}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="wrap">
          {error && <div className="state"><p>{error}</p></div>}

          {!error && favorites === null && (
            <div className="state"><p>Loading your saved hotels…</p></div>
          )}

          {!error && favorites !== null && total === 0 && (
            <div className="state">
              <p>No saved hotels yet. Run a search and tap the heart on any result.</p>
              <a className="cta" href="/search">Start a search →</a>
            </div>
          )}

          {hasItems && (
            <div className="grid">
              {shown.map((f) => {
                const photo = safePhoto(f.photo_url);
                const photoStyle = photo
                  ? { backgroundImage: `url('${photo}')` }
                  : { background: "linear-gradient(135deg,#bee1e6,#90e0ef)" };
                const saved = savedOn(f.created_at);
                return (
                  <article className="gcard" key={f.hotel_id}>
                    <div className="gphoto" style={photoStyle}>
                      {typeof f.fit_score === "number" && (
                        <span className="gbadge" style={{ background: blueScale(f.fit_score) }}>
                          {(Math.round(f.fit_score * 10) / 10).toFixed(1)}
                        </span>
                      )}
                      <button className="gremove" onClick={() => remove(f.hotel_id)} type="button" aria-label="Remove from saved">
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M6 7h12l-1 13H7L6 7zm3-3h6l1 2H8l1-2z" />
                        </svg>
                      </button>
                      {typeof f.price_amount === "number" && (
                        <div className="gpricebar">
                          {currencySymbol(f.price_currency)}{Math.round(f.price_amount)}
                          <span> /night</span>
                        </div>
                      )}
                    </div>
                    <div className="gbody">
                      <div className="gname">{f.hotel_name || "Hotel"}</div>
                      <div className="gloc">{[f.city, f.country].filter(Boolean).join(", ")}</div>
                      <div className="gfoot">
                        <span className="gsaved">{saved || ""}</span>
                        <a className="btn" href={bookingHref(f)} target="_blank" rel="nofollow sponsored noopener noreferrer">View on Booking →</a>
                      </div>
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
