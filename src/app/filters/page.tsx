// @ts-nocheck
"use client";

import { useEffect } from "react";
import { wireAuthNav } from "@/lib/authNav";

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

  :root{
    --ink:#03045e; --body:#33506a; --muted:#6f8a9c; --faint:#9fb4c2;
    --border:#e4edf3; --surface:#ffffff; --surface-2:#f3f9fc;
    --ocean:#0077b6; --sky:#90e0ef; --pale:#caf0f8; --cyan:#00b4d8;
  }
  *{box-sizing:border-box;}
  html,body{margin:0;padding:0;}
  body{font-family:'Geist',system-ui,sans-serif;background:#fff;color:var(--body);
       line-height:1.55;-webkit-font-smoothing:antialiased;}
  a{color:inherit;text-decoration:none;}
  .wrap{max-width:1160px;margin:0 auto;padding:0 40px;position:relative;z-index:3;}
  .serif{font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-weight:400;}

  /* logo */
  .logo{display:inline-flex;align-items:center;}
  .logo .w{font-weight:700;letter-spacing:-0.05em;color:var(--ink);font-size:30px;}
  .logo .sq{display:flex;align-items:center;justify-content:center;transform:rotate(-4deg);
            position:relative;overflow:hidden;border-radius:3px;margin-left:0.07em;width:32px;height:32px;}
  .logo .sq .h{position:absolute;top:0;height:100%;width:50%;}
  .logo .sq .h.l{left:0;background:var(--sky);}
  .logo .sq .h.r{right:0;background:var(--ink);}
  .logo .o{position:absolute;z-index:2;font-weight:700;letter-spacing:-0.05em;line-height:1;
           left:50%;top:50%;transform:translate(-50%,-53%);font-size:25px;}
  .logo .o.oL{color:#fff;clip-path:inset(0 50% 0 0);}
  .logo .o.oR{color:#fff;clip-path:inset(0 0 0 50%);}

  /* nav (logo hard-left, actions hard-right) */
  nav{position:sticky;top:0;z-index:50;background:rgba(255,255,255,0.72);
      backdrop-filter:blur(12px);border-bottom:1px solid rgba(228,237,243,0.8);}
  .nav-row{max-width:none;margin:0;padding:16px 40px;display:flex;align-items:center;justify-content:space-between;}
  .nav-links{display:flex;gap:30px;font-size:15px;font-weight:500;color:var(--muted);}
  .nav-links a:hover{color:var(--ink);}
  .nav-right{display:flex;align-items:center;gap:20px;}
  .login{font-size:15px;font-weight:600;color:var(--ink);}
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--ink);
       background:var(--ink);color:#fff;padding:12px 22px;border-radius:11px;
       font:600 14.5px 'Geist',sans-serif;cursor:pointer;transition:background 120ms;}
  .btn:hover{background:#06075f;}
  .btn--ghost{background:rgba(255,255,255,0.7);color:var(--ink);border-color:var(--ink);}
  .btn--ghost:hover{background:#fff;}
  .btn--lg{padding:15px 26px;font-size:16px;border-radius:12px;}

  /* sky + clouds */
  .skyband{position:relative;overflow:hidden;
    background:linear-gradient(180deg,#cfe9f6 0%,#dcf1fb 46%,#eef9fd 78%,#ffffff 100%);}
  .white{position:relative;overflow:hidden;background:#fff;}
  .cloud-layer{position:absolute;inset:0;pointer-events:none;z-index:1;}
  .cloud{position:absolute;will-change:transform;}
  .cloud svg{display:block;}
  @keyframes drift{from{transform:translateX(-20px);}to{transform:translateX(20px);}}

  /* header */
  header.head{position:relative;z-index:3;padding:54px 40px 30px;}
  .eyebrow{display:inline-flex;align-items:center;gap:9px;font-size:12px;font-weight:700;
           letter-spacing:0.14em;text-transform:uppercase;color:var(--ocean);margin-bottom:18px;}
  .eyebrow .dot{width:7px;height:7px;border-radius:50%;background:var(--cyan);}
  h1{font-size:clamp(34px,4.6vw,52px);font-weight:700;letter-spacing:-0.035em;line-height:1.04;
     margin:0;color:var(--ink);max-width:820px;text-wrap:balance;}
  .stamp{display:inline-block;background:var(--ocean);color:#fff;padding:0 14px 5px;border-radius:6px;line-height:1.04;}
  .sub{font-size:17px;color:var(--body);max-width:600px;margin:18px 0 0;}

  /* card */
  .card{position:relative;z-index:3;background:#fff;border:1px solid var(--border);border-radius:18px;
        box-shadow:0 40px 90px -54px rgba(3,4,94,0.4);margin:34px 0 0;overflow:visible;}
  .card-pad{padding:30px 34px;}
  .card + .card{margin-top:18px;}
  .card-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:4px;}
  .card-head h2{font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);font-weight:700;margin:0;}
  .card-head .head-right{display:flex;align-items:center;gap:10px;}
  .pill{font-size:12px;font-weight:600;color:var(--ocean);background:var(--surface-2);border:1px solid var(--border);
        border-radius:999px;padding:5px 12px;transition:color 120ms,background 120ms,border-color 120ms;}
  .pill.warn{color:#d94030;background:#fdecea;border-color:#f5c6c0;}
  /* geçmiş tarih yakına çekilince kullanıcıya bilgi notu */
  .datenote{margin-top:12px;font-size:13px;line-height:1.5;color:#8a5a00;background:#fff7e6;
            border:1px solid #ffe0a3;border-radius:10px;padding:10px 13px;display:flex;gap:8px;align-items:flex-start;}
  .datenote b{color:#6b4700;font-weight:600;}

  /* fix-to-100 button */
  .fixbtn{display:none;align-items:center;gap:6px;font:600 12px 'Geist',sans-serif;color:#fff;
          background:var(--ocean);border:1px solid var(--ocean);border-radius:999px;padding:6px 13px;cursor:pointer;
          transition:background 120ms;}
  .fixbtn:hover{background:#0369a1;animation:none;}
  /* toplam 100 değilken buton dikkat çeksin: yumuşak nabız + glow */
  .fixbtn.show{display:inline-flex;animation:fixpulse 1.6s ease-in-out infinite;}
  @keyframes fixpulse{
    0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(0,119,182,0.45);}
    50%{transform:scale(1.05);box-shadow:0 0 0 6px rgba(0,119,182,0);}
  }
  @media (prefers-reduced-motion: reduce){ .fixbtn.show{animation:none;} }

  /* fields grid */
  .fields{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border);
          border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-top:16px;}
  .field{background:#fff;padding:15px 18px;}
  .field label{display:block;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-bottom:7px;}
  .field input{width:100%;border:none;outline:none;background:transparent;font:500 16px 'Geist',sans-serif;color:var(--ink);letter-spacing:-0.01em;}
  .field input::placeholder{color:var(--faint);font-weight:400;}
  /* native date picker — .field görünümüyle uyumlu; takvim ikonu ocean tonuna yakın */
  .field input[type=date]{cursor:pointer;min-height:20px;}
  .field input[type=date]::-webkit-datetime-edit{color:var(--ink);}
  .field input[type=date]:not(.filled)::-webkit-datetime-edit{color:var(--faint);}
  .field input[type=date]::-webkit-calendar-picker-indicator{cursor:pointer;opacity:0.55;
    transition:opacity 120ms;padding:2px;margin-left:4px;}
  .field input[type=date]:hover::-webkit-calendar-picker-indicator{opacity:0.9;}
  .field input[type=date]::-webkit-inner-spin-button{display:none;}

  /* tag fields (Vibe / Must-have) — full width, searchable chips */
  .xfields{display:flex;flex-direction:column;gap:1px;background:var(--border);
           border:1px solid var(--border);border-radius:12px;margin-top:14px;}
  .xfield{background:#fff;padding:15px 18px;position:relative;}
  .xfield:first-child{border-radius:12px 12px 0 0;}
  .xfield:last-child{border-radius:0 0 12px 12px;}
  .xfield > label{display:block;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-bottom:10px;}
  .tagrow{display:flex;flex-wrap:wrap;align-items:center;gap:8px;}
  .tag{display:inline-flex;align-items:center;gap:5px;font-size:13.5px;font-weight:500;color:var(--ink);
       background:var(--surface-2);border:1px solid var(--border);border-radius:999px;padding:5px 7px 5px 13px;}
  .tag .x{display:inline-flex;align-items:center;justify-content:center;width:17px;height:17px;border-radius:50%;
          cursor:pointer;color:var(--muted);font-size:13px;line-height:1;transition:background 120ms,color 120ms;}
  .tag .x:hover{background:#dfeaf1;color:var(--ink);}
  .addtag{position:relative;}
  .addtag-btn{display:inline-flex;align-items:center;gap:5px;font:500 13px 'Geist',sans-serif;color:var(--ocean);
              background:#fff;border:1px dashed #b9d2dd;border-radius:999px;padding:5px 13px 5px 11px;cursor:pointer;
              transition:border-color 120ms,background 120ms;}
  .addtag-btn:hover{border-color:var(--ocean);background:var(--surface-2);}
  .addtag-btn svg{width:13px;height:13px;}
  .tagmenu{display:none;position:absolute;top:calc(100% + 7px);left:0;width:286px;background:#fff;
           border:1px solid var(--border);border-radius:13px;box-shadow:0 26px 64px -30px rgba(3,4,94,0.5);
           z-index:40;padding:8px;}
  .tagmenu.open{display:block;}
  /* MUST MENU UP: son alanin (must) dropdown-u yukari acilsin, kartin altinda kalmasin */
  [data-tagfield="must"] .tagmenu{top:auto;bottom:calc(100% + 7px);z-index:60;}
  [data-tagfield="vibe"] .tagmenu{top:auto;bottom:calc(100% + 7px);z-index:60;}
  .card{overflow:visible;} .xfields{overflow:visible;} .xfield{overflow:visible;}
  .tagmenu .srch{width:100%;border:1px solid var(--border);outline:none;border-radius:9px;background:var(--surface-2);
                 font:500 13.5px 'Geist',sans-serif;color:var(--ink);padding:8px 11px;margin-bottom:6px;}
  .tagmenu .srch::placeholder{color:var(--faint);font-weight:400;}
  .tagmenu .srch:focus{border-color:var(--ocean);background:#fff;}
  .tagmenu .opts{max-height:208px;overflow:auto;}
  .tagmenu .opt{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-radius:8px;
                font-size:13.5px;color:var(--ink);cursor:pointer;}
  .tagmenu .opt:hover,.tagmenu .opt.active{background:var(--surface-2);}
  .tagmenu .opt .ck{color:var(--ocean);opacity:0;}
  .tagmenu .opt.sel .ck{opacity:1;}
  .tagmenu .opt.sel{color:var(--muted);}
  .tagmenu .opt.add{color:var(--ocean);font-weight:500;}
  .tagmenu .empty{padding:9px 10px;font-size:13px;color:var(--muted);}

  /* weights */
  .wlist{margin-top:18px;display:flex;flex-direction:column;gap:18px;}
  .wrow{display:grid;grid-template-columns:150px 1fr 48px;align-items:center;gap:16px;}
  .wrow .wl{font-size:14px;font-weight:500;color:var(--ink);}
  .wrow .wl small{display:block;font-size:11px;font-weight:400;color:var(--faint);letter-spacing:0;margin-top:1px;}
  .wrow .wv{font-size:14px;font-weight:600;color:var(--ink);font-family:ui-monospace,monospace;text-align:right;}
  .slider{position:relative;height:22px;display:flex;align-items:center;}
  .slider .trk{position:absolute;left:0;right:0;height:6px;border-radius:3px;background:#e1ecf3;}
  .slider .fill{position:absolute;left:0;height:6px;border-radius:3px;background:var(--ocean);transition:width 120ms ease;}
  .slider input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:22px;background:transparent;margin:0;position:relative;z-index:2;cursor:ew-resize;}
  .slider input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:#fff;border:2px solid var(--ocean);box-shadow:0 2px 6px rgba(3,4,94,0.22);cursor:ew-resize;}
  .slider input[type=range]::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;border:2px solid var(--ocean);box-shadow:0 2px 6px rgba(3,4,94,0.22);cursor:ew-resize;}
  .wfoot{margin-top:18px;display:flex;justify-content:space-between;align-items:center;
         padding-top:16px;border-top:1px solid var(--border);}
  .wfoot .tip{font-size:12.5px;color:var(--muted);}
  .actions{display:flex;gap:10px;}

  /* extra flat sky before the sea photo */
  .sky-extend{height:120px;background:linear-gradient(180deg,#eef9fd 0%,#e9f6fc 100%);position:relative;z-index:2;}
  /* steps */
  .steps-sec{position:relative;overflow:hidden;padding:36px 0 90px;
    background:url("/staylo-confirm-bg.png") center top / cover no-repeat;}
  .steps-sec::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;
    background:linear-gradient(180deg, rgba(232,243,250,0.62) 0%, rgba(240,247,252,0.5) 22%, rgba(255,255,255,0.74) 58%, rgba(255,255,255,0.78) 100%);}
  .steps-sec .wrap{position:relative;z-index:3;}
  /* steps — journey (gradient ribbon, 4 nodes) */
  .jr{position:relative;margin-top:8px;height:392px;z-index:3;}
  .jr svg.path{position:absolute;inset:0;width:100%;height:100%;z-index:1;}
  .pt{position:absolute;width:220px;transform:translateX(-50%);text-align:center;z-index:2;}
  .pt h3{margin:0 0 6px;font-size:17px;font-weight:600;color:var(--ink);letter-spacing:-0.02em;}
  .pt p{margin:0;font-size:13px;color:var(--muted);line-height:1.5;}
  .pt .circ{width:88px;height:88px;border-radius:50%;margin:0 auto 13px;display:flex;align-items:center;justify-content:center;
            position:relative;color:#fff;box-shadow:0 18px 36px -14px rgba(3,69,122,0.7);}
  .pt .circ svg{width:40px;height:40px;}
  .pt .circ.done{box-shadow:0 0 0 4px #fff, 0 0 0 8px var(--cyan), 0 18px 36px -14px rgba(3,69,122,0.7);}
  .pt .circ.done .n,.pt .circ.past .n{background:var(--cyan);color:#fff;border-color:#fff;}
  .pt .circ.done .n svg,.pt .circ.past .n svg{width:18px;height:18px;}
  .nowtag{display:inline-block;vertical-align:middle;margin-left:8px;font-size:10.5px;font-weight:700;letter-spacing:0.08em;
          text-transform:uppercase;color:#fff;background:var(--cyan);border-radius:999px;padding:3px 9px;white-space:nowrap;}
  .pt:nth-child(2) .circ{background:linear-gradient(150deg,#48cae4,#0096c7);}
  .pt:nth-child(3) .circ{background:linear-gradient(150deg,#0096c7,#0077b6);}
  .pt:nth-child(4) .circ{background:linear-gradient(150deg,#0077b6,#03457a);}
  .pt:nth-child(5) .circ{background:linear-gradient(150deg,#03457a,#03045e);}
  .pt .circ .n{position:absolute;bottom:-6px;right:-6px;width:30px;height:30px;border-radius:50%;background:#fff;color:var(--ocean);
               font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 3px 8px rgba(3,4,94,0.2);}

  /* footer */
  footer{padding:40px 0;border-top:1px solid var(--border);font-size:13px;color:var(--muted);background:#fff;}
  .footer-row{max-width:1160px;margin:0 auto;padding:0 40px;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;}

  @media(max-width:880px){.fields{grid-template-columns:1fr;}.nav-links{display:none;}.wrow{grid-template-columns:120px 1fr 42px;}
    .jr{height:auto;position:static;}.jr svg.path{display:none;}
    .tagmenu{width:min(286px,calc(100vw - 80px));}
    .pt{position:static!important;width:auto;transform:none;margin:0 auto 26px;max-width:300px;}}
`;

const BODY = `
<!-- ===== NAV ===== -->
<nav>
  <div class="nav-row">
    <a href="/" class="logo"><span class="w">stayl</span><span class="sq"><span class="h l"></span><span class="h r"></span><span class="o oL">o</span><span class="o oR">o</span></span></a>
    <div class="nav-links">
      <a href="/#how">How it works</a>
      <a href="/#score">The score</a>
      <a href="/#faq">FAQ</a>
    </div>
    <div class="nav-right">
      <a href="/login" class="login">Log in</a>
      <a href="/saved" class="btn">Saved</a>
    </div>
  </div>
</nav>

<!-- ===== HEADER (sky) + CARD ===== -->
<div class="skyband">
  <div class="cloud-layer" data-zone="head"></div>
  <header class="head wrap">
    <div class="eyebrow"><span class="dot"></span>Step 2 of 4 · Confirm your search</div>
    <h1>Quiet boutique stay in <span style="white-space:nowrap"><span class="stamp">Lisbon</span>,</span> walkable, under €180.</h1>
    <p class="sub">Here's what we understood. Correct anything, set what matters most, then we'll read and score every matching hotel.</p>
  </header>

  <div class="wrap">
    <!-- criteria -->
    <section class="card">
      <div class="card-pad">
        <div class="card-head">
          <h2>Your search</h2>
          <div class="head-right"><span class="pill">8 criteria · AI-extracted</span></div>
        </div>
        <div class="fields">
          <div class="field"><label>City</label><input value="Lisbon, Portugal"></div>
          <div class="field"><label>Guests</label><input value="2 adults"></div>
          <div class="field"><label>Check in</label><input type="date" class="datepick"></div>
          <div class="field"><label>Check out</label><input type="date" class="datepick"></div>
          <div class="field"><label>Min budget (€/night)</label><input value="90"></div>
          <div class="field"><label>Max budget (€/night)</label><input value="180"></div>
        </div>
        <div class="datenote" id="dateNote" style="display:none"></div>
        <div class="xfields">
          <div class="xfield" data-tagfield="vibe">
            <label>Vibe <span style="color:var(--faint);font-weight:400;text-transform:none;letter-spacing:0">— optional</span></label>
            <div class="tagrow" data-tagrow></div>
          </div>
          <div class="xfield" data-tagfield="must">
            <label>Must-have <span style="color:var(--faint);font-weight:400;text-transform:none;letter-spacing:0">— optional</span></label>
            <div class="tagrow" data-tagrow></div>
          </div>
        </div>
      </div>
    </section>

    <!-- weights -->
    <section class="card">
      <div class="card-pad">
        <div class="card-head">
          <h2>How we'll rank hotels</h2>
          <div class="head-right">
            <span class="pill" id="total">Total 100%</span>
            <button type="button" class="fixbtn" id="fix100">Adjust to 100%</button>
          </div>
        </div>
        <div class="wlist" id="weights"></div>
        <div class="wfoot">
          <span class="tip">Drag any slider — each moves on its own.&nbsp;</span>
          <div class="actions">
            <a href="/search" class="btn btn--ghost">← Edit search</a>
            <a href="/results" class="btn">Find hotels →</a>
          </div>
        </div>
      </div>
    </section>
  </div>
  <div class="sky-extend"></div>
</div>

<!-- ===== 4-STEP EXPLAINER ===== -->
<section class="steps-sec">
  <div class="wrap">
    <div class="jr">
      <svg class="path" viewBox="0 0 1000 392" preserveAspectRatio="none">
        <defs><linearGradient id="rib" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#90e0ef"></stop><stop offset="0.4" stop-color="#00b4d8"></stop>
          <stop offset="0.7" stop-color="#0077b6"></stop><stop offset="1" stop-color="#03457a"></stop>
        </linearGradient></defs>
        <path d="M125 278 C 250 278 250 74 375 74 S 500 278 625 278 S 750 74 875 74" fill="none" stroke="url(#rib)" stroke-width="6" stroke-linecap="round" opacity="0.92"></path>
      </svg>
      <div class="pt" style="left:12.5%;top:234px;">
        <div class="circ past"><span class="n"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"></path></svg></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"></path><path d="M8 10h8M8 13.5h5"></path></svg></div>
        <h3>Describe the trip</h3><p>Type it like you'd tell a friend — plain language.</p>
      </div>
      <div class="pt" style="left:37.5%;top:30px;">
        <div class="circ done"><span class="n"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"></path></svg></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11M9 12h11M9 18h11"></path><path d="M3.5 6l1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2"></path></svg></div>
        <h3>Confirm the criteria <span class="nowtag">You're here</span></h3><p>Location, dates, budget &amp; vibe — fix anything.</p>
      </div>
      <div class="pt" style="left:62.5%;top:234px;">
        <div class="circ"><span class="n">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v3.5a5 5 0 0 1-10 0V4z"></path><path d="M7 6H4.2v.8a3 3 0 0 0 3 3M17 6h2.8v.8a3 3 0 0 1-3 3"></path><path d="M12 12.5V16M9 20h6M10 16.5h4"></path></svg></div>
        <h3>Get one ranked answer</h3><p>Every hotel read, scored and ranked for you.</p>
      </div>
      <div class="pt" style="left:87.5%;top:30px;">
        <div class="circ"><span class="n">4</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2.5"></rect><path d="M3 9h18M8 2.5v4M16 2.5v4"></path><path d="M9 14.5l2 2 4-4"></path></svg></div>
        <h3>Book on Booking.com</h3><p>Same price — booked securely through Booking.com.</p>
      </div>
    </div>
  </div>
</section>

<!-- ===== FOOTER ===== -->
<footer>
  <div class="footer-row">
    <a href="/" class="logo"><span class="w" style="font-size:24px">stayl</span><span class="sq" style="width:26px;height:26px"><span class="h l"></span><span class="h r"></span><span class="o oL" style="font-size:20px">o</span><span class="o oR" style="font-size:20px">o</span></span></a>
    <span style="font-size:11.5px;">© 2026 Staylo · Reviews from Google &amp; Tripadvisor · Bookings via Booking.com</span>
  </div>
</footer>
`;

export default function ConfirmPage() {
  useEffect(() => {
    /* eslint-disable */

    /* ---------- load search data from sessionStorage ---------- */
    let SD = null;
    try { SD = JSON.parse(sessionStorage.getItem("staylo_search") || "null"); } catch(e) { SD = null; }
    const F = SD && SD.filters ? SD.filters : null;
    if (!F) { window.location.replace("/search"); return; }
    const LANG = (F && ["en","tr","de","fr","es"].includes(F.userLanguage)) ? F.userLanguage : "en";

    /* ---------- I18N: UI strings ---------- */
    const I18N = {
      en: { yourSearch:"Your search", rank:"How we will rank hotels", vibe:"Vibe", must:"Must-have", optional:"optional",
            add:"Add", addVibe:"Add a vibe", addMust:"Add a must-have", total:"Total", adjust:"Adjust to 100%",
            editSearch:"Edit search", findHotels:"Find hotels", searchVibes:"Search vibes…", searchMust:"Search must-haves…",
            noMore:"No more options", addCustom:"Add", inThe:"Your search in",
            dateFixed:"The date you gave had already passed, so we set it to <b>{d}</b> — adjust it if you like.",
            w:{safety:["Safety & area","Verified neighbourhood + recent reviews"],quiet:["Quietness","Noise mentions across reviews"],walk:["Walkability","Distance to centre + transit"],value:["Value","Price vs. quality vs. location"],clean:["Cleanliness","Housekeeping mentions"],family:["Family fit","Cribs, space, kid amenities"]} },
      tr: { yourSearch:"Aramanız", rank:"Otelleri nasıl sıralayacağız", vibe:"Tarz", must:"Olmazsa olmaz", optional:"opsiyonel",
            add:"Ekle", addVibe:"Tarz ekle", addMust:"Olmazsa olmaz ekle", total:"Toplam", adjust:"%100'e ayarla",
            editSearch:"Aramayı düzenle", findHotels:"Otelleri bul", searchVibes:"Tarz ara…", searchMust:"Özellik ara…",
            noMore:"Başka seçenek yok", addCustom:"Ekle", inThe:"Arama:",
            dateFixed:"Girdiğin tarih geçmişti, <b>{d}</b> olarak ayarladık — istersen değiştir.",
            w:{safety:["Güvenlik & bölge","Doğrulanmış mahalle + güncel yorumlar"],quiet:["Sessizlik","Yorumlarda gürültü bahsi"],walk:["Yürünebilirlik","Merkeze + ulaşıma uzaklık"],value:["Fiyat/performans","Fiyat vs. kalite vs. konum"],clean:["Temizlik","Kat hizmeti bahsi"],family:["Aileye uygunluk","Bebek yatağı, alan, çocuk olanakları"]} },
      de: { yourSearch:"Deine Suche", rank:"So bewerten wir Hotels", vibe:"Ambiente", must:"Unverzichtbar", optional:"optional",
            add:"Hinzufügen", addVibe:"Ambiente hinzufügen", addMust:"Unverzichtbares hinzufügen", total:"Gesamt", adjust:"Auf 100% setzen",
            editSearch:"Suche bearbeiten", findHotels:"Hotels finden", searchVibes:"Ambiente suchen…", searchMust:"Ausstattung suchen…",
            noMore:"Keine weiteren Optionen", addCustom:"Hinzufügen", inThe:"Deine Suche in",
            w:{safety:["Sicherheit & Lage","Geprüftes Viertel + aktuelle Bewertungen"],quiet:["Ruhe","Lärm-Erwähnungen in Bewertungen"],walk:["Fußläufigkeit","Entfernung zum Zentrum + Verkehr"],value:["Preis-Leistung","Preis vs. Qualität vs. Lage"],clean:["Sauberkeit","Erwähnungen zur Reinigung"],family:["Familienfreundlich","Betten, Platz, Kinderausstattung"]} },
      fr: { yourSearch:"Votre recherche", rank:"Comment nous classons les hôtels", vibe:"Ambiance", must:"Indispensable", optional:"facultatif",
            add:"Ajouter", addVibe:"Ajouter une ambiance", addMust:"Ajouter un indispensable", total:"Total", adjust:"Ajuster à 100%",
            editSearch:"Modifier la recherche", findHotels:"Trouver des hôtels", searchVibes:"Rechercher des ambiances…", searchMust:"Rechercher des équipements…",
            noMore:"Aucune autre option", addCustom:"Ajouter", inThe:"Votre recherche à",
            w:{safety:["Sécurité & quartier","Quartier vérifié + avis récents"],quiet:["Calme","Mentions de bruit dans les avis"],walk:["Accessibilité à pied","Distance au centre + transports"],value:["Rapport qualité-prix","Prix vs. qualité vs. emplacement"],clean:["Propreté","Mentions de ménage"],family:["Adapté aux familles","Lits bébé, espace, équipements enfants"]} },
      es: { yourSearch:"Tu búsqueda", rank:"Cómo clasificamos los hoteles", vibe:"Ambiente", must:"Imprescindible", optional:"opcional",
            add:"Añadir", addVibe:"Añadir ambiente", addMust:"Añadir imprescindible", total:"Total", adjust:"Ajustar al 100%",
            editSearch:"Editar búsqueda", findHotels:"Buscar hoteles", searchVibes:"Buscar ambientes…", searchMust:"Buscar servicios…",
            noMore:"No hay más opciones", addCustom:"Añadir", inThe:"Tu búsqueda en",
            w:{safety:["Seguridad & zona","Barrio verificado + reseñas recientes"],quiet:["Tranquilidad","Menciones de ruido en reseñas"],walk:["Caminabilidad","Distancia al centro + transporte"],value:["Relación calidad-precio","Precio vs. calidad vs. ubicación"],clean:["Limpieza","Menciones de limpieza"],family:["Apto para familias","Cunas, espacio, servicios para niños"]} },
    };
    const T = I18N[LANG];

    /* ---------- Vibe / Must-have tag fields (two-layer: value + label) ----------
       Each option: { v: snake_case_value (stored, English, goes to Booking/scoring),
                      en/tr/de/fr/es: display label per language }
       selected[] holds VALUES (snake_case). Chip shows label in LANG. */
    const VIBE_OPTS = [
      { v:"quiet_calm",      en:"Quiet & calm",        tr:"Sessiz & sakin",       de:"Ruhig & entspannt",   fr:"Calme & paisible",      es:"Tranquilo y sereno" },
      { v:"lively_social",   en:"Lively & social",     tr:"Canlı & sosyal",       de:"Lebhaft & gesellig",  fr:"Animé & convivial",     es:"Animado y social" },
      { v:"boutique_design", en:"Boutique & design-led",tr:"Butik & tasarım",     de:"Boutique & Design",   fr:"Boutique & design",     es:"Boutique y diseño" },
      { v:"romantic",        en:"Romantic",            tr:"Romantik",             de:"Romantisch",          fr:"Romantique",            es:"Romántico" },
      { v:"family_friendly", en:"Family-friendly",     tr:"Aile dostu",           de:"Familienfreundlich",  fr:"Familial",              es:"Familiar" },
      { v:"local_authentic", en:"Local & authentic",   tr:"Yerel & otantik",      de:"Lokal & authentisch", fr:"Local & authentique",   es:"Local y auténtico" },
      { v:"luxury",          en:"Luxury",              tr:"Lüks",                 de:"Luxus",               fr:"Luxe",                  es:"Lujo" },
      { v:"budget_friendly", en:"Budget-friendly",     tr:"Bütçe dostu",          de:"Preisgünstig",        fr:"Économique",            es:"Económico" },
      { v:"trendy_modern",   en:"Trendy & modern",     tr:"Modern & trend",       de:"Trendig & modern",    fr:"Tendance & moderne",    es:"Moderno y de moda" },
      { v:"historic_charming",en:"Historic & charming",tr:"Tarihi & şirin",       de:"Historisch & charmant",fr:"Historique & charmant",es:"Histórico y con encanto" },
      { v:"adults_only",     en:"Adults-only",         tr:"Sadece yetişkin",      de:"Nur für Erwachsene",  fr:"Adultes uniquement",    es:"Solo adultos" },
      { v:"nature_views",    en:"Nature & views",      tr:"Doğa & manzara",       de:"Natur & Aussicht",    fr:"Nature & vues",         es:"Naturaleza y vistas" },
    ];
    const MUST_OPTS = [
      { v:"breakfast_included",en:"Breakfast included",tr:"Kahvaltı dahil",       de:"Frühstück inklusive", fr:"Petit-déjeuner inclus", es:"Desayuno incluido" },
      { v:"free_wifi",       en:"Free WiFi",           tr:"Ücretsiz WiFi",        de:"Kostenloses WLAN",    fr:"WiFi gratuit",          es:"WiFi gratis" },
      { v:"walk_to_centre",  en:"Walk to centre",      tr:"Merkeze yürüme",       de:"Zu Fuß ins Zentrum",  fr:"À pied du centre",      es:"A pie del centro" },
      { v:"air_conditioning",en:"Air conditioning",    tr:"Klima",                de:"Klimaanlage",         fr:"Climatisation",         es:"Aire acondicionado" },
      { v:"pool",            en:"Pool",                tr:"Havuz",                de:"Pool",                fr:"Piscine",               es:"Piscina" },
      { v:"pet_friendly",    en:"Pet-friendly",        tr:"Evcil hayvan dostu",   de:"Haustierfreundlich",  fr:"Animaux acceptés",      es:"Admite mascotas" },
      { v:"family_rooms",    en:"Family rooms",        tr:"Aile odaları",         de:"Familienzimmer",      fr:"Chambres familiales",   es:"Habitaciones familiares" },
      { v:"free_parking",    en:"Free parking",        tr:"Ücretsiz otopark",     de:"Kostenlose Parkplätze",fr:"Parking gratuit",      es:"Parking gratis" },
      { v:"airport_shuttle", en:"Airport shuttle",     tr:"Havalimanı servisi",   de:"Flughafentransfer",   fr:"Navette aéroport",      es:"Traslado aeropuerto" },
      { v:"gym_fitness",     en:"Gym / fitness",       tr:"Spor salonu",          de:"Fitnessraum",         fr:"Salle de sport",        es:"Gimnasio" },
      { v:"kitchenette",     en:"Kitchen / kitchenette",tr:"Mutfak",              de:"Küche / Küchenzeile", fr:"Cuisine / kitchenette", es:"Cocina / kitchenette" },
      { v:"reception_24h",   en:"24-hour reception",   tr:"24 saat resepsiyon",   de:"24-Stunden-Rezeption",fr:"Réception 24h/24",      es:"Recepción 24h" },
      { v:"non_smoking",     en:"Non-smoking",         tr:"Sigara içilmez",       de:"Nichtraucher",        fr:"Non-fumeur",            es:"No fumadores" },
      { v:"spa",             en:"Spa",                 tr:"Spa",                  de:"Spa",                 fr:"Spa",                   es:"Spa" },
      { v:"balcony",         en:"Balcony",             tr:"Balkon",               de:"Balkon",              fr:"Balcon",                es:"Balcón" },
    ];

    const TAGSETS = {
      vibe: { options: VIBE_OPTS, selected: [], placeholder: T.searchVibes, addLabel: T.addVibe },
      must: { options: MUST_OPTS, selected: [], placeholder: T.searchMust, addLabel: T.addMust },
    };

    // labelFor: value -> display label in current LANG (fallback: en, then value)
    function labelFor(setKey, val) {
      const opt = TAGSETS[setKey].options.find(o => o.v === val);
      if (opt) return opt[LANG] || opt.en || val;
      return val; // custom value: show as-is
    }

    // preselect must-haves from search (snake_case already from Gemini)
    try {
      const mh = F && Array.isArray(F.mustHaves) ? F.mustHaves : null;
      if (mh) {
        // Gemini returns lowercase words like "pool","breakfast","wifi"; map common ones to our values
        const MAP = { pool:"pool", breakfast:"breakfast_included", wifi:"free_wifi", parking:"free_parking", gym:"gym_fitness" };
        TAGSETS.must.selected = mh.map(x => MAP[(""+x).toLowerCase()] || (""+x).toLowerCase().replace(/\s+/g,"_"));
      }
    } catch(e) {}

    const plusSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
    const ckSvg = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
    const tagCleanups = [];
    const esc = (x) => (""+x).replace(/"/g, '&quot;');

    document.querySelectorAll('[data-tagfield]').forEach(field => {
      const key = field.getAttribute('data-tagfield');
      const set = TAGSETS[key];
      if (!set) return;
      const row = field.querySelector('[data-tagrow]');
      let menuEl = null;
      let activeIdx = -1;

      function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; activeIdx = -1; } }

      // add a custom typed value: snake_case it, label = what user typed
      function addCustom(text) {
        const label = (text || "").trim();
        if (!label) return;
        const val = label.toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "");
        if (!val) return;
        if (!set.selected.includes(val)) {
          // remember custom label so chip shows what they typed
          set._custom = set._custom || {};
          set._custom[val] = label;
          set.selected.push(val);
        }
        const keep = menuEl ? (menuEl.querySelector('.srch') || {}).value || "" : "";
        render(); openMenu(keep);
      }
      function toggleVal(val) {
        if (set.selected.includes(val)) set.selected = set.selected.filter(s => s !== val);
        else set.selected.push(val);
      }
      function remove(val) { set.selected = set.selected.filter(s => s !== val); render(); }

      function displayLabel(val) {
        if (set._custom && set._custom[val]) return set._custom[val];
        return labelFor(key, val);
      }

      function buildMenu(filter) {
        const f = (filter || "").trim().toLowerCase();
        // match against label in current language OR english OR value
        const matches = set.options.filter(o =>
          (o[LANG]||"").toLowerCase().includes(f) || o.en.toLowerCase().includes(f) || o.v.includes(f.replace(/\s+/g,"_"))
        );
        let html = '<input class="srch" placeholder="' + esc(set.placeholder) + '" />';
        html += '<div class="opts">';
        if (matches.length) {
          matches.forEach((o, i) => {
            const sel = set.selected.includes(o.v);
            html += '<div class="opt' + (sel ? ' sel' : '') + (i === activeIdx ? ' active' : '') +
                    '" data-val="' + esc(o.v) + '">' +
                    '<span>' + (o[LANG]||o.en) + '</span><span class="ck">' + ckSvg + '</span></div>';
          });
        }
        const labelExists = set.options.some(o => (o[LANG]||"").toLowerCase() === f || o.en.toLowerCase() === f);
        if (f && !labelExists) {
          html += '<div class="opt add" data-add="' + esc(filter.trim()) + '">+ ' + T.addCustom + ' “' + filter.trim() + '”</div>';
        }
        if (!matches.length && !f) html += '<div class="empty">' + T.noMore + '</div>';
        html += '</div>';
        return html;
      }

      function openMenu(keepVal) {
        const keep = typeof keepVal === 'string' ? keepVal
          : (menuEl ? (menuEl.querySelector('.srch') || {}).value || "" : "");
        closeMenu();
        const btn = row.querySelector('.addtag');
        if (!btn) return;
        menuEl = document.createElement('div');
        menuEl.className = 'tagmenu open';
        menuEl.innerHTML = buildMenu(keep);
        btn.appendChild(menuEl);
        const srch = menuEl.querySelector('.srch');
        srch.value = keep; srch.focus();
        srch.addEventListener('input', () => { activeIdx = -1; refreshOpts(srch.value); });
        srch.addEventListener('keydown', (e) => {
          const opts = Array.from(menuEl.querySelectorAll('.opt'));
          if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(opts.length - 1, activeIdx + 1); paintActive(opts); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(0, activeIdx - 1); paintActive(opts); }
          else if (e.key === 'Enter') { e.preventDefault(); if (activeIdx >= 0 && opts[activeIdx]) selectOpt(opts[activeIdx]); else addCustom(srch.value); }
          else if (e.key === 'Escape') { closeMenu(); }
        });
        wireOpts();
      }

      function refreshOpts(filter) {
        if (!menuEl) return;
        const optsWrap = menuEl.querySelector('.opts');
        const tmp = document.createElement('div');
        tmp.innerHTML = buildMenu(filter);
        optsWrap.innerHTML = tmp.querySelector('.opts').innerHTML;
        wireOpts();
      }
      function paintActive(opts) {
        opts.forEach((o, i) => o.classList.toggle('active', i === activeIdx));
        if (opts[activeIdx]) opts[activeIdx].scrollIntoView({ block: 'nearest' });
      }
      function selectOpt(opt) {
        if (!opt) return;
        const keep = menuEl ? (menuEl.querySelector('.srch') || {}).value || "" : "";
        if (opt.dataset.add != null) { addCustom(opt.dataset.add); return; }
        if (opt.dataset.val != null) { toggleVal(opt.dataset.val); render(); openMenu(keep); }
      }
      function wireOpts() {
        menuEl.querySelectorAll('.opt').forEach(opt => {
          opt.addEventListener('mousedown', (e) => { e.preventDefault(); selectOpt(opt); });
        });
      }

      function render() {
        closeMenu();
        const chips = set.selected.map(val =>
          '<span class="tag" data-v="' + esc(val) + '">' + displayLabel(val) +
          '<span class="x" data-rm="' + esc(val) + '">×</span></span>'
        ).join("");
        row.innerHTML = chips +
          '<span class="addtag"><button type="button" class="addtag-btn">' + plusSvg +
          (set.selected.length ? T.add : set.addLabel) +
          '</button></span>';
        row.querySelectorAll('[data-rm]').forEach(x =>
          x.addEventListener('click', () => remove(x.getAttribute('data-rm')))
        );
        const btn = row.querySelector('.addtag-btn');
        btn.addEventListener('click', (e) => { e.stopPropagation(); if (menuEl) closeMenu(); else openMenu(); });
      }

      const outside = (e) => { if (menuEl && !field.contains(e.target)) closeMenu(); };
      document.addEventListener('click', outside);
      tagCleanups.push(() => document.removeEventListener('click', outside));

      render();
    });

    /* ---------- fill criteria fields ---------- */
    const fieldByLabel = (txt) => {
      const labels = Array.from(document.querySelectorAll(".field label"));
      const m = labels.find(l => l.textContent.trim().toLowerCase().startsWith(txt));
      return m ? m.parentElement.querySelector("input") : null;
    };
    const cityStr = [F.city, F.country].filter(Boolean).join(", ");
    const cityInput = fieldByLabel("city"); if (cityInput && cityStr) cityInput.value = cityStr;
    const guestsInput = fieldByLabel("guests"); if (guestsInput && F.guests) guestsInput.value = F.guests + (F.guests > 1 ? " adults" : " adult");
    // F'de değer yoksa alanı TEMİZLE (HTML'deki hardcoded 12.09.2026/90/180
    // placeholder-default'ları kalmasın → persist edilince sahte filtre olmasın).
    const ciInput = fieldByLabel("check in"); if (ciInput) ciInput.value = F.checkIn || "";
    const coInput = fieldByLabel("check out"); if (coInput) coInput.value = F.checkOut || "";
    // ---------- native takvim seçici (type=date) ----------
    // Değer HER ZAMAN YYYY-MM-DD döner → parseDate'e dokunmadan uyar. min=bugün;
    // check-out'un min'i check-in+1 gün (checkout>checkin garantisi); alana tıklayınca
    // takvim açılır (showPicker). .filled → dolu/boş metin rengi.
    (function(){
      const todayISO = new Date().toISOString().slice(0, 10);
      const nextDayISO = (iso) => {
        const d = new Date(iso + "T00:00:00Z");
        if (isNaN(d.getTime())) return todayISO;
        d.setUTCDate(d.getUTCDate() + 1);
        return d.toISOString().slice(0, 10);
      };
      const markFilled = (el) => { if (el) el.classList.toggle("filled", !!el.value); };
      const openPicker = (el) => { try { if (el.showPicker) el.showPicker(); } catch (e) {} };
      if (ciInput) {
        ciInput.min = todayISO;
        markFilled(ciInput);
        ciInput.addEventListener("click", () => openPicker(ciInput));
      }
      if (coInput) {
        coInput.min = (ciInput && ciInput.value) ? nextDayISO(ciInput.value) : nextDayISO(todayISO);
        markFilled(coInput);
        coInput.addEventListener("click", () => openPicker(coInput));
      }
      if (ciInput && coInput) {
        ciInput.addEventListener("change", () => {
          markFilled(ciInput);
          coInput.min = nextDayISO(ciInput.value || todayISO);
          if (coInput.value && coInput.value < coInput.min) coInput.value = ""; // geçersiz kalanı temizle
          markFilled(coInput);
        });
        coInput.addEventListener("change", () => markFilled(coInput));
      }
    })();
    // D1: girilen tarih geçmişte kaldıysa yakına çekildi — kullanıcıya bildir
    (function(){
      const note = document.getElementById("dateNote");
      if (note && F.dateAdjusted && F.dateAdjusted.to) {
        const tpl = T.dateFixed || "The date you gave had already passed, so we set it to <b>{d}</b> — adjust it if you like.";
        note.innerHTML = '<span aria-hidden="true">📅</span><span>' + tpl.replace("{d}", F.dateAdjusted.to) + '</span>';
        note.style.display = "flex";
      }
    })();
    const minInput = fieldByLabel("min budget"); if (minInput) minInput.value = (F.budget && F.budget.min != null) ? F.budget.min : "";
    const maxInput = fieldByLabel("max budget"); if (maxInput) maxInput.value = (F.budget && F.budget.max != null) ? F.budget.max : "";

    // title + city stamp (localized)
    const h1El = document.querySelector("header.head h1");
    if (h1El && F.city) h1El.innerHTML = T.inThe + ' <span style="white-space:nowrap"><span class="stamp">' + F.city + '</span></span>.';

    // localized headings + labels
    (function(){
      const heads = document.querySelectorAll(".card-head h2");
      if (heads[0]) heads[0].textContent = T.yourSearch;
      if (heads[1]) heads[1].textContent = T.rank;
      const vibeLab = document.querySelector('[data-tagfield="vibe"] > label');
      const mustLab = document.querySelector('[data-tagfield="must"] > label');
      const optSpan = ' <span style="color:var(--faint);font-weight:400;text-transform:none;letter-spacing:0">— ' + T.optional + "</span>";
      if (vibeLab) vibeLab.innerHTML = T.vibe + optSpan;
      if (mustLab) mustLab.innerHTML = T.must + optSpan;
      const ghost = document.querySelector(".actions .btn--ghost"); if (ghost) ghost.textContent = "← " + T.editSearch;
      const find = document.querySelector(".actions .btn:not(.btn--ghost)"); if (find) find.textContent = T.findHotels + " →";
    })();

    /* ---------- weights (independent sliders + adjust-to-100%) ---------- */
    const WEIGHTS = [
      { id: "safety", label: "Safety & area", hint: "Verified neighbourhood + recent reviews", w: 25 },
      { id: "quiet",  label: "Quietness",     hint: "Noise mentions across reviews",            w: 25 },
      { id: "walk",   label: "Walkability",   hint: "Distance to centre + transit",             w: 20 },
      { id: "value",  label: "Value",         hint: "Price vs. quality vs. location",           w: 15 },
      { id: "clean",  label: "Cleanliness",   hint: "Housekeeping mentions",                    w: 10 },
      { id: "family", label: "Family fit",    hint: "Cribs, space, kid amenities",              w: 5 },
    ];
    const wrapEl = document.getElementById('weights');
    const totalEl = document.getElementById('total');
    const fixBtn = document.getElementById('fix100');

    function total() { return WEIGHTS.reduce((s, w) => s + w.w, 0); }
    function paintTotals() {
      const t = total();
      if (totalEl) { totalEl.textContent = T.total + " " + t + "%"; totalEl.classList.toggle('warn', t !== 100); }
      if (fixBtn) fixBtn.classList.toggle('show', t !== 100);
    }
    function renderWeights() {
      if (!wrapEl) return;
      wrapEl.innerHTML = WEIGHTS.map(x => `
        <div class="wrow">
          <div class="wl">${x.label}<small>${x.hint}</small></div>
          <div class="slider">
            <div class="trk"></div><div class="fill" data-fill="${x.id}" style="width:${x.w}%"></div>
            <input type="range" min="0" max="100" value="${x.w}" data-id="${x.id}"/>
          </div>
          <div class="wv" data-val="${x.id}">${x.w}%</div>
        </div>`).join("");
      wrapEl.querySelectorAll('input[type=range]').forEach(inp => {
        inp.addEventListener('input', () => setWeight(inp.dataset.id, parseInt(inp.value, 10)));
      });
      paintTotals();
    }
    function setWeight(id, v) {
      const w = WEIGHTS.find(x => x.id === id);
      if (!w) return;
      w.w = v;
      const f = wrapEl.querySelector(`[data-fill="${id}"]`); if (f) f.style.width = v + "%";
      const vv = wrapEl.querySelector(`[data-val="${id}"]`); if (vv) vv.textContent = v + "%";
      paintTotals();
    }
    function adjustTo100() {
      const sum = total();
      if (sum === 100) return;
      if (sum === 0) {
        const even = Math.round(100 / WEIGHTS.length);
        WEIGHTS.forEach((w, i) => w.w = i === 0 ? 100 - even * (WEIGHTS.length - 1) : even);
      } else {
        WEIGHTS.forEach(w => w.w = Math.round(w.w * 100 / sum));
        const drift = 100 - total();
        if (drift !== 0) { const t = [...WEIGHTS].sort((a, b) => b.w - a.w)[0]; if (t) t.w += drift; }
      }
      WEIGHTS.forEach(w => {
        const f = wrapEl.querySelector(`[data-fill="${w.id}"]`); if (f) f.style.width = w.w + "%";
        const vv = wrapEl.querySelector(`[data-val="${w.id}"]`); if (vv) vv.textContent = w.w + "%";
        const rg = wrapEl.querySelector(`input[data-id="${w.id}"]`); if (rg) rg.value = w.w;
      });
      paintTotals();
    }
    if (fixBtn) fixBtn.addEventListener('click', adjustTo100);

    // weights from search
    if (F && F.weights) {
      const wmap = { safety:"safety", quiet:"quiet", walk:"walkability", value:"value", clean:"cleanliness", family:"family" };
      WEIGHTS.forEach(w => { const k = wmap[w.id]; if (k && typeof F.weights[k] === "number") w.w = F.weights[k]; });
    }
    // localized slider labels
    if (T.w) { WEIGHTS.forEach(w => { if (T.w[w.id]) { w.label = T.w[w.id][0]; w.hint = T.w[w.id][1]; } }); }
    renderWeights();

    /* ---------- Hafta 7: filters düzenlemelerini sessionStorage'a yaz (Find'e basınca) ---------- */
    // Eskiden "Find hotels →" düz linkti → tarih/guests/budget/weight düzenlemeleri
    // kayboluyordu (/results orijinal arama F'sini okuyordu). Şimdi tıklamada güncel
    // alanları F'ye merge edip yazıyoruz; ardından link /results'a gider. Tarih formatı
    // geçersizse null yazılır → /api/hotels server-side default'a düşer.
    (function persistCriteriaOnFind(){
      const findBtn = document.querySelector(".actions .btn:not(.btn--ghost)");
      if (!findBtn || !SD) return;
      findBtn.addEventListener("click", function(){
        // Ağırlıkları submit'te sessizce 100'e normalize et + gösterilen değerleri
        // güncelle (kullanıcının gördüğü = kaydedilen). adjustTo100 zaten WEIGHTS'i
        // yeniden ölçekleyip fill/value/range DOM'unu günceller; slider fill'i CSS
        // transition ile kısa bir geçişle kayar. Sonra normalize edilmiş w'leri oku.
        adjustTo100();
        // Hem YYYY-MM-DD hem DD.MM.YYYY (alan placeholder'ı) kabul et; YYYY-MM-DD'ye normalize et.
        const parseDate = (v) => {
          const s = String(v || "").trim();
          if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
          const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
          return m ? (m[3] + "-" + m[2] + "-" + m[1]) : null;
        };
        const wmap = { safety:"safety", quiet:"quiet", walk:"walkability", value:"value", clean:"cleanliness", family:"family" };
        const weights = {};
        WEIGHTS.forEach(w => { const k = wmap[w.id]; if (k) weights[k] = w.w; });
        const g = parseInt(String((guestsInput && guestsInput.value) || "").replace(/[^0-9]/g, ""), 10);
        const minV = (minInput && String(minInput.value).trim() !== "") ? Number(minInput.value) : null;
        const maxV = (maxInput && String(maxInput.value).trim() !== "") ? Number(maxInput.value) : null;
        SD.filters = Object.assign({}, F, {
          checkIn: parseDate(ciInput && ciInput.value),
          checkOut: parseDate(coInput && coInput.value),
          guests: (Number.isFinite(g) && g > 0) ? g : (F.guests || 2),
          budget: {
            min: (minV != null && Number.isFinite(minV)) ? minV : null,
            max: (maxV != null && Number.isFinite(maxV)) ? maxV : null,
            currency: (F.budget && F.budget.currency) || "EUR",
          },
          weights: weights,
        });
        SD.ts = Date.now();
        try { sessionStorage.setItem("staylo_search", JSON.stringify(SD)); } catch(e) {}
      });
    })();

    /* ---------- clouds ---------- */
    let UID = 0;
    function realCloud(w, h, type, color) {
      const id = "c" + (UID++);
      const seed = Math.floor(Math.random() * 9000) + 1;
      const [r, g, b] = color.map(v => Math.round(v * 255));
      const col = `rgb(${r},${g},${b})`;
      const sh = `rgb(${Math.round(r * 0.70)},${Math.round(g * 0.78)},${Math.round(b * 0.90)})`;
      const J = (v, a) => v + (Math.random() * 2 - 1) * a;
      const Z = (v) => v * (0.82 + Math.random() * 0.40);
      let base;
      if (type === "streak") {
        base = [[0.5, 0.5, 0.42, 0.11], [0.30, 0.52, 0.16, 0.07], [0.70, 0.47, 0.18, 0.07], [0.5, 0.5, 0.30, 0.06]];
      } else {
        base = [[0.32, 0.50, 0.20, 0.18], [0.50, 0.40, 0.245, 0.225], [0.66, 0.49, 0.205, 0.185],
                [0.43, 0.55, 0.16, 0.14], [0.60, 0.56, 0.15, 0.125], [0.25, 0.55, 0.13, 0.115],
                [0.78, 0.55, 0.12, 0.105]];
      }
      const lumps = base.map(([cx, cy, rx, ry]) => [J(cx, 0.035), J(cy, 0.028), Z(rx), Z(ry)]);
      const body = lumps.map(([cx, cy, rx, ry]) =>
        `<ellipse cx="${(w * cx).toFixed(1)}" cy="${(h * cy).toFixed(1)}" rx="${(w * rx).toFixed(1)}" ry="${(h * ry).toFixed(1)}" fill="url(#g${id})"/>`).join("");
      const shade = lumps.map(([cx, cy, rx, ry]) =>
        `<ellipse cx="${(w * (cx + rx * 0.26)).toFixed(1)}" cy="${(h * (cy + ry * 0.46)).toFixed(1)}" rx="${(w * rx * 0.72).toFixed(1)}" ry="${(h * ry * 0.64).toFixed(1)}" fill="url(#s${id})"/>`).join("");
      const dscale = type === "streak" ? Math.round(h * 0.18) : Math.round(h * 0.14);
      const blur = type === "streak" ? 3 : 2;
      const bf = type === "streak" ? (0.013 + Math.random() * 0.004).toFixed(4) + " 0.02"
                                   : (0.010 + Math.random() * 0.004).toFixed(4);
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
            <feGaussianBlur stdDeviation="${blur}"/>
          </filter>
        </defs>
        <g filter="url(#t${id})">${body}${shade}</g>
      </svg>`;
    }
    const WHITE_CLOUD = [1, 1, 1];
    const BLUE_CLOUD = [0.64, 0.84, 0.95];
    const ZONES = {
      head: { color: WHITE_CLOUD, list: [
        { l: "60%", t: "-2%", type: "cumulus", w: 460, h: 210, o: 0.95, d: 82 },
        { l: "-5%", t: "24%", type: "cumulus", w: 340, h: 160, o: 0.8, d: 90 },
        { l: "30%", t: "6%", type: "cumulus", w: 200, h: 104, o: 0.5, d: 62 },
      ]},
      steps: { color: BLUE_CLOUD, list: [
        { l: "-4%", t: "10%", type: "cumulus", w: 320, h: 150, o: 0.26, d: 84 },
        { l: "80%", t: "54%", type: "cumulus", w: 280, h: 132, o: 0.22, d: 80 },
      ]},
    };
    function paintAll() {
      document.querySelectorAll('.cloud-layer').forEach(el => {
        const z = ZONES[el.dataset.zone]; if (!z) return;
        el.innerHTML = z.list.map((c, i) => {
          const svg = realCloud(c.w, c.h, c.type, z.color);
          const dir = i % 2 ? "reverse" : "normal";
          return `<div class="cloud" style="left:${c.l};top:${c.t};opacity:${c.o};animation:drift ${c.d}s ease-in-out ${dir} infinite alternate;">${svg}</div>`;
        }).join("");
      });
    }
    paintAll();
    wireAuthNav();

    return () => { tagCleanups.forEach(fn => fn()); };
    /* eslint-enable */
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div dangerouslySetInnerHTML={{ __html: BODY }} />
    </>
  );
}