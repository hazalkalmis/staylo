// @ts-nocheck
"use client";

import { useEffect } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
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

  /* nav */
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

  /* search-entry hero */
  .hero{position:relative;z-index:3;text-align:center;padding:64px 40px 12px;}
  .hero h1{font-size:clamp(42px,6.4vw,86px);font-weight:800;letter-spacing:-0.045em;line-height:0.98;
           margin:0 auto;max-width:none;color:var(--ink);}
  .hero h1 .stamp{display:inline-block;background:var(--ocean);color:#fff;padding:2px 22px 12px;border-radius:9px;
                  transform:rotate(-2deg);margin-top:10px;white-space:nowrap;}
  .searchwrap{max-width:820px;margin:42px auto 0;position:relative;z-index:3;}
  .searchbox{background:#fff;border:1px solid var(--border);border-radius:18px;
             box-shadow:0 40px 90px -54px rgba(3,4,94,0.45);padding:28px 30px 22px;text-align:left;}
  .searchbox textarea{width:100%;border:none;outline:none;resize:none;background:transparent;
                      font:400 19px/1.5 'Geist',sans-serif;color:var(--ink);}
  .searchbox textarea::placeholder{color:var(--faint);}
  .searchbox .divider{height:1px;background:var(--border);margin:6px 0 16px;}
  .searchbox .sb-foot{display:flex;align-items:center;justify-content:space-between;gap:14px;}
  .searchbox .hint{font-size:13px;color:var(--muted);}
  .searchbox .hint b{color:var(--ocean);font-weight:600;}
  .chips{max-width:980px;margin:18px auto 0;display:flex;flex-wrap:wrap;justify-content:center;gap:10px;position:relative;z-index:3;}
  .chip{font-size:13.5px;color:var(--body);background:rgba(255,255,255,0.85);border:1px solid var(--border);
        border-radius:11px;padding:10px 15px;cursor:pointer;white-space:nowrap;transition:border-color 120ms,color 120ms,background 120ms;}
  .chip:hover{border-color:var(--ocean);color:var(--ink);background:#fff;}

  /* ===== results ===== */
  .rhead{padding:50px 40px 4px;position:relative;z-index:3;}
  .reyebrow{display:inline-flex;align-items:center;gap:9px;font-size:12px;font-weight:700;
            letter-spacing:0.14em;text-transform:uppercase;color:var(--ocean);margin-bottom:16px;}
  .reyebrow .dot{width:7px;height:7px;border-radius:50%;background:var(--cyan);}
  .rhead h1{font-size:clamp(30px,4vw,46px);font-weight:700;letter-spacing:-0.035em;line-height:1.05;
            margin:0;color:var(--ink);max-width:860px;text-wrap:balance;}
  .rhead h1 .stamp{display:inline-block;background:var(--ocean);color:#fff;padding:0 13px 5px;border-radius:6px;line-height:1.04;}
  .rsub{font-size:16px;color:var(--body);margin:16px 0 0;max-width:680px;}
  .rsub b{color:var(--ink);font-weight:600;}
  .rfilters{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:20px 0 0;}
  .adjust-btn{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:600;color:#fff;
              background:var(--ink);border:1px solid var(--ink);border-radius:999px;padding:7px 16px 7px 13px;
              cursor:pointer;transition:background 120ms;margin-left:auto;white-space:nowrap;}
  .adjust-btn:hover{background:#06075f;}
  .adjust-btn svg{width:15px;height:15px;}
  .rfilters .wtag{font-size:12px;font-weight:600;color:var(--ocean);background:rgba(255,255,255,0.8);
                  border:1px solid var(--border);border-radius:999px;padding:6px 13px;}
  .rfilters .wtag b{color:var(--muted);font-weight:500;margin-left:5px;}

  .map-card{display:none;position:relative;z-index:3;margin-top:26px;border-radius:18px;overflow:hidden;
            border:1px solid var(--border);box-shadow:0 30px 70px -56px rgba(3,4,94,0.5);background:#f3f9fc;}
  #hotelMap{width:100%;height:380px;}
  .map-msg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
           text-align:center;padding:24px;font-size:14px;color:var(--muted);}

  .results{margin-top:26px;display:flex;flex-direction:column;gap:18px;position:relative;z-index:3;}
  .rcard{background:#fff;border:1px solid var(--border);border-radius:18px;overflow:hidden;
         box-shadow:0 30px 70px -56px rgba(3,4,94,0.5);display:grid;grid-template-columns:228px 1fr 210px;
         transition:border-color 150ms,box-shadow 150ms;}
  .rcard.highlight{border-color:var(--ocean);box-shadow:0 0 0 3px rgba(0,119,182,0.32),0 30px 70px -56px rgba(3,4,94,0.5);}
  .rthumb{position:relative;}
  .rthumb .rthumb-ph{position:absolute;inset:0;display:block;}
  .rthumb .rank{position:absolute;top:14px;left:14px;z-index:5;width:34px;height:34px;border-radius:9px;
                background:rgba(3,4,94,0.86);color:#fff;font-size:14px;font-weight:700;
                display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);}
  .rthumb .rfav{position:absolute;top:12px;right:12px;z-index:5;width:36px;height:36px;border:none;border-radius:50%;
                background:rgba(255,255,255,0.92);backdrop-filter:blur(4px);cursor:pointer;display:flex;
                align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(3,4,94,0.25);transition:transform 120ms;}
  .rthumb .rfav:hover{transform:scale(1.08);}
  .rthumb .rfav svg{width:19px;height:19px;fill:none;stroke:var(--ink);stroke-width:2;}
  .rthumb .rfav.on svg{fill:#e0245e;stroke:#e0245e;}
  .rmid{padding:24px 28px;display:flex;flex-direction:column;border-left:1px solid var(--border);border-right:1px solid var(--border);}
  .rname{font-size:22px;font-weight:600;letter-spacing:-0.025em;color:var(--ink);}
  .rmeta{font-size:13px;color:var(--muted);margin-top:5px;}
  .rdist{font-size:12.5px;color:var(--ocean);font-weight:600;margin-top:8px;}
  .rnearby{font-size:12px;color:var(--muted);margin-top:4px;line-height:1.5;}
  .rnearby b{color:var(--ink);font-weight:600;}
  .rsumq{font-size:14px;color:var(--body);margin:14px 0 0;max-width:480px;}
  .rsumq .serif{color:var(--ocean);font-size:18px;}
  .ribbon{margin-top:auto;display:flex;border:1px solid var(--border);border-radius:11px;overflow:hidden;}
  .rib{flex:1;padding:9px 11px;border-right:1px solid var(--border);display:flex;flex-direction:column;gap:6px;}
  .rib:last-child{border-right:none;}
  .rib .nm{font-size:9.5px;letter-spacing:0.04em;text-transform:uppercase;color:var(--muted);display:flex;justify-content:space-between;gap:5px;}
  .rib .nm .wt{color:var(--faint);}
  .rib .vl{font-size:15px;font-weight:600;font-family:ui-monospace,monospace;color:var(--ink);}
  .rib .bar{height:3px;background:#e1ecf3;border-radius:2px;position:relative;overflow:hidden;}
  .rib .bar i{position:absolute;inset:0 auto 0 0;height:100%;border-radius:2px;}

  .rrail{padding:24px 22px;display:flex;flex-direction:column;align-items:center;gap:13px;
         background:linear-gradient(180deg,#f3f9fc,#e9f4fb);}
  .rbadge{width:84px;height:84px;border-radius:16px;color:#fff;display:flex;align-items:center;justify-content:center;
          font-size:33px;font-weight:700;letter-spacing:-0.03em;box-shadow:0 14px 30px -12px rgba(3,69,122,0.6);}
  .rblabel{font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--ocean);font-weight:700;
           display:inline-flex;align-items:center;gap:5px;}
  .info{width:14px;height:14px;border:1px solid rgba(0,119,182,0.5);border-radius:50%;color:var(--ocean);font-size:9px;
        display:inline-flex;align-items:center;justify-content:center;cursor:help;position:relative;
        font-family:'Instrument Serif',Georgia,serif;font-style:italic;}
  .info:hover{border-color:var(--ocean);background:var(--ocean);color:#fff;}
  .info .tip{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:var(--ink);color:#eaf6fc;
             font-size:11px;font-style:normal;letter-spacing:0;text-transform:none;font-weight:400;line-height:1.45;
             padding:9px 11px;width:210px;text-align:left;border-radius:8px;opacity:0;pointer-events:none;transition:opacity 120ms;z-index:20;}
  .info:hover .tip{opacity:1;}
  .rsrc{display:flex;gap:14px;padding:11px 0;border-top:1px solid rgba(0,119,182,0.18);border-bottom:1px solid rgba(0,119,182,0.18);
        width:100%;justify-content:center;}
  .src-row{display:inline-flex;align-items:center;gap:6px;}
  .src-glyph{width:16px;height:16px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;}
  .src-glyph.b{background:#003580;} .src-glyph.g{background:#fff;border:1px solid var(--border);color:var(--body);}
  .src-line b{font-family:ui-monospace,monospace;font-weight:600;color:var(--ink);font-size:12px;}
  .rprice{font-size:21px;font-weight:700;color:var(--ink);letter-spacing:-0.02em;}
  .rprice span{font-size:12px;color:var(--muted);font-weight:400;}
  .rrail .btn{width:100%;}

  @media(max-width:880px){.rcard{grid-template-columns:1fr;}.rthumb{height:180px;}.rmid{border:none;border-top:1px solid var(--border);border-bottom:1px solid var(--border);}.ribbon{flex-wrap:wrap;}.rib{flex:1 1 33%;}
    #hotelMap{height:260px;}}

  /* card */
  .card{position:relative;z-index:3;background:#fff;border:1px solid var(--border);border-radius:18px;
        box-shadow:0 40px 90px -54px rgba(3,4,94,0.4);margin:34px 0 0;overflow:hidden;}
  .card-pad{padding:30px 34px;}
  .card + .card{margin-top:18px;}
  .card-head{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin-bottom:4px;}
  .card-head h2{font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);font-weight:700;margin:0;}
  .pill{font-size:12px;font-weight:600;color:var(--ocean);background:var(--surface-2);border:1px solid var(--border);
        border-radius:999px;padding:5px 12px;}

  /* fields grid */
  .fields{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border);
          border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-top:16px;}
  .field{background:#fff;padding:15px 18px;}
  .field label{display:block;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-bottom:7px;}
  .field input{width:100%;border:none;outline:none;background:transparent;font:500 16px 'Geist',sans-serif;color:var(--ink);letter-spacing:-0.01em;}
  .field input::placeholder{color:var(--faint);font-weight:400;}

  /* weights */
  .wlist{margin-top:18px;display:flex;flex-direction:column;gap:18px;}
  .wrow{display:grid;grid-template-columns:150px 1fr 48px;align-items:center;gap:16px;}
  .wrow .wl{font-size:14px;font-weight:500;color:var(--ink);}
  .wrow .wl small{display:block;font-size:11px;font-weight:400;color:var(--faint);letter-spacing:0;margin-top:1px;}
  .wrow .wv{font-size:14px;font-weight:600;color:var(--ink);font-family:ui-monospace,monospace;text-align:right;}
  .slider{position:relative;height:22px;display:flex;align-items:center;}
  .slider .trk{position:absolute;left:0;right:0;height:6px;border-radius:3px;background:#e1ecf3;}
  .slider .fill{position:absolute;left:0;height:6px;border-radius:3px;background:var(--ocean);}
  .slider input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:22px;background:transparent;margin:0;position:relative;z-index:2;cursor:ew-resize;}
  .slider input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:#fff;border:2px solid var(--ocean);box-shadow:0 2px 6px rgba(3,4,94,0.22);cursor:ew-resize;}
  .slider input[type=range]::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;border:2px solid var(--ocean);box-shadow:0 2px 6px rgba(3,4,94,0.22);cursor:ew-resize;}
  .wfoot{margin-top:18px;display:flex;justify-content:space-between;align-items:center;
         padding-top:16px;border-top:1px solid var(--border);}
  .wfoot .tip{font-size:12.5px;color:var(--muted);}
  .actions{display:flex;gap:10px;}

  /* extra flat sky before the sea photo */
  .sky-extend{height:80px;background:linear-gradient(180deg,#eef9fd 0%,#dcecfa 100%);position:relative;z-index:2;}
  /* steps */
  .steps-sec{position:relative;overflow:hidden;padding:30px 0 90px;
    background:url("/staylo-result-bg.png") center top / 100% auto no-repeat #d3e8f8;}
  .steps-sec::before{content:"";position:absolute;top:0;left:0;right:0;height:230px;z-index:0;pointer-events:none;
    background:linear-gradient(180deg,#dcecfa 0%,rgba(218,236,251,0.62) 38%,rgba(214,233,250,0.26) 68%,rgba(214,233,250,0) 100%);}
  .steps-sec .wrap{position:relative;z-index:3;}
  /* steps — journey (gradient ribbon, 4 nodes) */
  .jr{position:relative;margin-top:8px;height:392px;z-index:3;}
  .jr svg.path{position:absolute;inset:0;width:100%;height:100%;z-index:1;}
  .pt{position:absolute;width:220px;transform:translateX(-50%);text-align:center;z-index:2;}
  .pt h3{margin:0 0 6px;font-size:17px;font-weight:600;color:var(--ink);letter-spacing:-0.02em;text-shadow:0 1px 10px rgba(255,255,255,0.96),0 0 4px rgba(255,255,255,0.96);}
  .pt p{margin:0;font-size:13px;color:var(--muted);line-height:1.5;text-shadow:0 1px 8px rgba(255,255,255,0.96),0 0 3px rgba(255,255,255,0.9);}
  .pt .circ{width:88px;height:88px;border-radius:50%;margin:0 auto 13px;display:flex;align-items:center;justify-content:center;
            position:relative;color:#fff;box-shadow:0 18px 36px -14px rgba(3,69,122,0.7);}
  .pt .circ svg{width:40px;height:40px;}
  /* completed (past) / current step */
  .pt .circ.past{opacity:0.66;}
  .pt .circ.past .n{background:#9fb4c2;border-color:#fff;}
  .pt .circ.past .n svg,.pt .circ.here .n svg{width:18px;height:18px;}
  .pt .circ.here{box-shadow:0 0 0 4px #fff, 0 0 0 9px var(--cyan), 0 18px 36px -14px rgba(3,69,122,0.7);}
  .pt .circ.here .n{background:var(--cyan);color:#fff;border-color:#fff;}
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
  .footer-row{max-width:none;margin:0;padding:0 40px;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;}

  @media(max-width:880px){.fields{grid-template-columns:1fr;}.nav-links{display:none;}.wrow{grid-template-columns:120px 1fr 42px;}
    .jr{height:auto;position:static;}.jr svg.path{display:none;}
    .pt{position:static!important;width:auto;transform:none;margin:0 auto 26px;max-width:300px;}}`;

const BODY = `
<!-- ===== NAV ===== -->
<nav>
  <div class="nav-row">
    <a href="/" class="logo"><span class="w">stayl</span><span class="sq"><span class="h l"></span><span class="h r"></span><span class="o oL">o</span><span class="o oR">o</span></span></a>
    <div class="nav-right">
      <a href="/login" class="login">Log in</a>
      <a href="/saved" class="btn">Saved</a>
    </div>
  </div>
</nav>

<!-- ===== HEADER (sky) + CARD ===== -->
<div class="skyband">
  <div class="cloud-layer" data-zone="head"></div>
  <div class="rhead wrap">
    <div class="reyebrow"><span class="dot"></span>Step 3 of 4 · Your ranked answer</div>
    <h1 id="rHeadline">Your ranked stays.</h1>
    <p class="rsub" id="rSub">Scoring hotels on your priorities…</p>
    <div class="rfilters" id="rFilters"></div>
  </div>

  <div class="wrap"><div class="map-card" id="mapWrap"><div id="hotelMap"></div></div></div>

  <div class="results wrap" id="resultsList"></div>

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
        <div class="circ past"><span class="n"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"></path></svg></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11M9 12h11M9 18h11"></path><path d="M3.5 6l1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2"></path></svg></div>
        <h3>Confirm the criteria</h3><p>Location, dates, budget &amp; vibe — fix anything.</p>
      </div>
      <div class="pt" style="left:62.5%;top:234px;">
        <div class="circ here"><span class="n"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"></path></svg></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v3.5a5 5 0 0 1-10 0V4z"></path><path d="M7 6H4.2v.8a3 3 0 0 0 3 3M17 6h2.8v.8a3 3 0 0 1-3 3"></path><path d="M12 12.5V16M9 20h6M10 16.5h4"></path></svg></div>
        <h3>Get one ranked answer <span class="nowtag">You're here</span></h3><p>Every hotel read, scored and ranked for you.</p>
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

export default function ResultPage() {
  useEffect(() => {
    /* eslint-disable */

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
      const bodyEls = lumps.map(([cx, cy, rx, ry]) =>
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
        <g filter="url(#t${id})">${bodyEls}${shade}</g>
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

    /* ---------- fetch real hotels from /api/hotels using search → filters data ---------- */
    const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const safePhotoUrl = (url) => (typeof url === "string" && /^https:\/\//.test(url)) ? url.replace(/'/g, "%27") : null;

    const resultsEl = document.getElementById("resultsList");

    /* ---------- favorites (Hafta 7): kalp durumlarını doldur + toggle ---------- */
    // Girişsizse GET 401 döner → hearts boş kalır, tıklayınca /login'e yönlendiririz.
    async function setupFavorites(hotels) {
      const hotelsById = {};
      hotels.forEach((h) => { hotelsById[String(h.id)] = h; });
      let loggedIn = true;
      const favset = new Set();
      try {
        const res = await fetch("/api/favorites");
        if (res.status === 401) loggedIn = false;
        else if (res.ok) {
          const data = await res.json().catch(() => ({}));
          (data.favorites || []).forEach((f) => favset.add(String(f.hotel_id)));
        }
      } catch (e) {}
      if (cancelled) return;
      document.querySelectorAll(".rcard").forEach((card) => {
        const id = card.getAttribute("data-hotel-id");
        const btn = card.querySelector(".rfav");
        if (btn && favset.has(String(id))) btn.classList.add("on");
      });
      if (!resultsEl) return;
      resultsEl.addEventListener("click", async (e) => {
        const btn = e.target && e.target.closest ? e.target.closest(".rfav") : null;
        if (!btn) return;
        const card = btn.closest(".rcard");
        const id = card && card.getAttribute("data-hotel-id");
        if (!id) return;
        if (!loggedIn) { window.location.href = "/login?next=/results"; return; }
        if (btn.disabled) return;
        const wasOn = btn.classList.contains("on");
        btn.classList.toggle("on"); // iyimser
        btn.disabled = true;
        try {
          let r;
          if (wasOn) {
            r = await fetch(`/api/favorites?hotelId=${encodeURIComponent(id)}`, { method: "DELETE" });
          } else {
            const h = hotelsById[String(id)] || {};
            const body = {
              hotelId: String(id),
              hotelName: h.name ? String(h.name) : null,
              city: F && F.city ? String(F.city) : null,
              country: F && F.country ? String(F.country) : null,
              photoUrl: safePhotoUrl(h.photo),
              priceAmount: h.price ? h.price.amount : null,
              priceCurrency: h.price ? h.price.currency : null,
              fitScore: h.score && typeof h.score.fit === "number" ? h.score.fit : null,
            };
            r = await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
          }
          if (r && r.status === 401) { window.location.href = "/login?next=/results"; return; }
          // ⚠️ İyimser toggle'ı SADECE sunucu onaylarsa bırak; başarısızsa geri al.
          // (Eskiden yalnızca 401 kontrol ediliyordu → 400/429/500 sessizce yutuluyor,
          // heart dolu kalıp sahte "kaydedildi" görüntüsü veriyordu — /saved boş çıkıyordu.)
          if (!r || !r.ok) { btn.classList.toggle("on"); btn.title = "Couldn't update — tap to retry"; }
          else { btn.removeAttribute("title"); }
        } catch (err) {
          btn.classList.toggle("on"); // ağ hatası → geri al
        } finally {
          btn.disabled = false;
        }
      });
    }
    function renderMessage(text, isError) {
      if (!resultsEl) return;
      resultsEl.innerHTML = `<section class="card"><div class="card-pad" style="text-align:center;padding:54px 34px;">
        <p style="margin:0;font-size:15px;color:${isError ? "#d94030" : "var(--muted)"}">${esc(text)}</p>
      </div></section>`;
    }
    /* ---------- score UI helpers ---------- */
    // 6 kriter — API'deki WEIGHTED_CRITERIA ile birebir aynı anahtarlar, kısa etiketler.
    const CRIT = [
      ["safety", "Safety"], ["quiet", "Quiet"], ["family", "Family"],
      ["value", "Value"], ["walkability", "Walk"], ["cleanliness", "Clean"],
    ];
    // F henüz bu noktada tanımlı değil (aşağıda) — default'la başlat, F okununca güncelle.
    let WEIGHTS = { safety: 20, quiet: 20, family: 10, value: 25, walkability: 15, cleanliness: 10 };
    const fmtScore = (v) => (Math.round(v * 10) / 10).toFixed(1);
    const fmtCount = (n) => {
      if (typeof n !== "number" || !isFinite(n) || n <= 0) return "";
      return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k" : String(n);
    };
    function barColor(v) {
      if (v >= 8) return "#0096c7";
      if (v >= 6) return "#00b4d8";
      if (v >= 4) return "#48cae4";
      return "#9fb4c2";
    }
    function fitBg(v) {
      if (v >= 8) return "linear-gradient(150deg,#0096c7,#03457a)";
      if (v >= 6.5) return "linear-gradient(150deg,#00b4d8,#0077b6)";
      if (v >= 5) return "linear-gradient(150deg,#48cae4,#0096c7)";
      return "linear-gradient(150deg,#8ca6b5,#5f7688)";
    }
    function ribbonHtml(criteria) {
      if (!criteria || typeof criteria !== "object") return "";
      const cells = CRIT.map(([k, label]) => {
        const v = typeof criteria[k] === "number" ? criteria[k] : null;
        const pct = v == null ? 0 : Math.max(0, Math.min(100, v * 10));
        const w = typeof WEIGHTS[k] === "number" ? WEIGHTS[k] : 0;
        const col = v == null ? "#cfdbe4" : barColor(v);
        return `<div class="rib">
          <div class="nm"><span>${label}</span><span class="wt">${w}%</span></div>
          <div class="vl">${v == null ? "–" : fmtScore(v)}</div>
          <div class="bar"><i style="width:${pct}%;background:${col};"></i></div>
        </div>`;
      }).join("");
      return `<div class="ribbon">${cells}</div>`;
    }
    // Tripadvisor owl (Ollie) — Display Requirements: kaynak atfı için logo zorunlu.
    const taOwl = `<svg width="24" height="15" viewBox="0 0 42 24" aria-label="Tripadvisor" style="flex:0 0 auto">
      <circle cx="12" cy="12" r="11" fill="#00aa6c"></circle>
      <circle cx="30" cy="12" r="11" fill="#00aa6c"></circle>
      <circle cx="12" cy="12" r="6.6" fill="#fff"></circle>
      <circle cx="30" cy="12" r="6.6" fill="#fff"></circle>
      <circle cx="12" cy="12" r="3" fill="#004f32"></circle>
      <circle cx="30" cy="12" r="3" fill="#004f32"></circle>
      <path d="M17 12 L25 12 L21 18 Z" fill="#00aa6c"></path>
    </svg>`;
    let BUBID = 0;
    // Tripadvisor bubble rating (5 baloncuk, orana göre yeşil dolgu) — zorunlu atıf biçimi.
    function taBubbles(rating) {
      const n = 5, r = 3.4, gap = 9.2, pad = r;
      const cx = (i) => pad + gap * i;
      const w = cx(n - 1) + r, h = 2 * r;
      const frac = Math.max(0, Math.min(1, rating / 5));
      const id = "tab" + (BUBID++);
      let empty = "", full = "";
      for (let i = 0; i < n; i++) {
        empty += `<circle cx="${cx(i)}" cy="${r}" r="${r}" fill="#d4dde2"></circle>`;
        full += `<circle cx="${cx(i)}" cy="${r}" r="${r}" fill="#00aa6c"></circle>`;
      }
      return `<svg width="${(w * 1.7).toFixed(0)}" height="${(h * 1.7).toFixed(0)}" viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" style="flex:0 0 auto">
        <defs><clipPath id="${id}"><rect x="0" y="0" width="${(w * frac).toFixed(2)}" height="${h}"></rect></clipPath></defs>
        ${empty}
        <g clip-path="url(#${id})">${full}</g>
      </svg>`;
    }
    function sourcesHtml(sources) {
      if (!sources || typeof sources !== "object") return "";
      const rows = [];
      const g = sources.google;
      if (g && typeof g.rating === "number") {
        const cnt = fmtCount(g.reviewCount);
        rows.push(`<div class="src-row" title="Rating from Google">
          <span class="src-glyph g">G</span>
          <span class="src-line"><b>${fmtScore(g.rating)}</b>★${cnt ? `<span style="color:var(--muted);font-size:11px;margin-left:3px;">${cnt}</span>` : ""}</span>
        </div>`);
      }
      const t = sources.tripadvisor;
      if (t && typeof t.rating === "number") {
        // Tripadvisor eşleşmesi yoksa bu satır hiç render edilmez → sadece Google gösterilir, kırılma olmaz.
        const cnt = fmtCount(t.reviewCount);
        rows.push(`<div class="src-row" title="Rating from Tripadvisor">
          ${taOwl}${taBubbles(t.rating)}
          <span class="src-line"><b>${fmtScore(t.rating)}</b>${cnt ? `<span style="color:var(--muted);font-size:11px;margin-left:3px;">${cnt}</span>` : ""}</span>
        </div>`);
      }
      if (!rows.length) return "";
      return `<div class="rsrc" style="flex-direction:column;align-items:stretch;gap:9px;">${rows.join("")}</div>`;
    }

    /* ---------- header: bind to real search + result data ---------- */
    const ADJUST_BTN = `<a href="/filters" class="adjust-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"></path></svg>Adjust priorities</a>`;
    const currencySymbol = (c) => ({ EUR: "€", USD: "$", GBP: "£", TRY: "₺" }[c] || (c ? c + " " : "€"));
    function formatDateRange(ci, co) {
      if (!ci || !co) return null;
      const a = new Date(ci + "T00:00:00"), b = new Date(co + "T00:00:00");
      if (isNaN(a) || isNaN(b)) return null;
      const opt = { month: "short", day: "numeric" };
      return a.toLocaleDateString("en-US", opt) + " – " + b.toLocaleDateString("en-US", opt);
    }
    function formatBudget(bud) {
      if (!bud) return null;
      const s = currencySymbol(bud.currency || "EUR");
      const min = typeof bud.min === "number" ? bud.min : null;
      const max = typeof bud.max === "number" ? bud.max : null;
      if (min != null && max != null) return `${s}${Math.round(min)}–${s}${Math.round(max)}`;
      if (max != null) return `Under ${s}${Math.round(max)}`;
      if (min != null) return `From ${s}${Math.round(min)}`;
      return null;
    }
    // Toplam yorum sayısını 100'e yuvarlayıp "+" ile göster ("12,400+").
    function fmtReviews(n) {
      if (!n || n <= 0) return null;
      return (Math.floor(n / 100) * 100).toLocaleString("en-US") + "+";
    }
    // hotelList null → arama sürüyor (sadece şehir/çipler); dolu → gerçek sayılar.
    function renderHeader(hotelList) {
      const city = (F && F.city) ? String(F.city) : "";
      const hEl = document.getElementById("rHeadline");
      if (hEl) hEl.innerHTML = city ? `Your ranked stays in <span class="stamp">${esc(city)}</span>.` : `Your ranked stays.`;

      const chips = [];
      const dr = formatDateRange(F && F.checkIn, F && F.checkOut);
      if (dr) chips.push(`<span class="wtag">${esc(dr)}</span>`);
      const guests = (F && Number(F.guests)) || 0;
      if (guests > 0) chips.push(`<span class="wtag">${guests} ${guests === 1 ? "guest" : "guests"}</span>`);
      const bud = formatBudget(F && F.budget);
      if (bud) chips.push(`<span class="wtag">${esc(bud)}</span>`);
      const fEl = document.getElementById("rFilters");
      if (fEl) fEl.innerHTML = chips.join("") + ADJUST_BTN;

      const sEl = document.getElementById("rSub");
      if (!sEl) return;
      if (!hotelList) { sEl.textContent = "Scoring hotels on your priorities…"; return; }
      // Gerçek toplam yorum: her otelin Google + Tripadvisor count'ları (elimizdeki veriden).
      let totalReviews = 0;
      for (const h of hotelList) {
        const s = h.sources || {};
        if (s.google && typeof s.google.reviewCount === "number") totalReviews += s.google.reviewCount;
        if (s.tripadvisor && typeof s.tripadvisor.reviewCount === "number") totalReviews += s.tripadvisor.reviewCount;
      }
      const n = hotelList.length;
      const hotelTxt = `<b>${n} ${n === 1 ? "hotel" : "hotels"}</b>${city ? ` in ${esc(city)}` : ""}`;
      const rev = fmtReviews(totalReviews);
      sEl.innerHTML = rev
        ? `Based on <b>${rev} reviews</b> from Google &amp; Tripadvisor across ${hotelTxt}, scored on your priorities.`
        : `Scored ${hotelTxt} on your priorities.`;
    }

    function hotelCardHtml(h, rank) {
      const photo = safePhotoUrl(h.photo);
      const thumbStyle = photo
        ? `background-image:url('${photo}');background-size:cover;background-position:center;`
        : `background:linear-gradient(135deg,#bee1e6,#90e0ef);`;
      const priceHtml = h.price
        ? `€${Math.round(h.price.amount)}<span> /night</span>`
        : `<span style="font-size:13px;color:var(--muted);">Price unavailable</span>`;
      const distHtml = h.distanceToCenter
        ? `<div class="rdist">${esc(h.distanceToCenter)} to city center</div>`
        : "";
      const nearbyHtml = Array.isArray(h.nearbyAttractions) && h.nearbyAttractions.length
        ? `<div class="rnearby">${h.nearbyAttractions.map((a) => `${esc(a.name)} <b>${esc(a.distance)}</b>`).join(" · ")}</div>`
        : "";
      const score = h.score || null;
      const summaryHtml = score && score.summary
        ? `<div class="rsumq">${esc(score.summary)}</div>`
        : "";
      const ribbon = score ? ribbonHtml(score.criteria) : "";
      // Belirgin Staylo fit rozeti — skor yoksa (analiz gelmediyse) rozet gizlenir, kart kırılmaz.
      const fit = score && typeof score.fit === "number" ? score.fit : null;
      const badgeHtml = fit != null
        ? `<div class="rbadge" style="background:${fitBg(fit)}">${fmtScore(fit)}</div>
           <div class="rblabel">Staylo fit
             <span class="info">i<span class="tip">Weighted 0–10 score built from guest reviews across Google &amp; Tripadvisor, matched to your priorities.</span></span>
           </div>`
        : "";
      const sources = sourcesHtml(h.sources);
      // "View on Booking" → /api/redirect (server logs click + 302 to Booking deep-link).
      // target=_blank YOK (roadmap kuralı) — aynı sekmede gider.
      const rp = new URLSearchParams();
      rp.set("hotel", String(h.id ?? ""));
      if (h.name) rp.set("name", String(h.name));
      if (F && F.city) rp.set("city", String(F.city));
      if (F && F.checkIn) rp.set("checkIn", String(F.checkIn));
      if (F && F.checkOut) rp.set("checkOut", String(F.checkOut));
      if (F && F.guests) rp.set("guests", String(F.guests));
      const bookingHref = "/api/redirect?" + rp.toString();
      return `<article class="rcard" data-hotel-id="${esc(h.id)}">
        <div class="rthumb"><div class="rthumb-ph" style="${thumbStyle}"></div><div class="rank">${rank}</div>
          <button class="rfav" type="button" aria-label="Save hotel"><svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></button>
        </div>
        <div class="rmid">
          <div class="rname">${esc(h.name)}</div>
          <div class="rmeta">${esc(h.address || "")}</div>
          ${distHtml}
          ${nearbyHtml}
          ${summaryHtml}
          ${ribbon}
        </div>
        <div class="rrail">
          ${badgeHtml}
          ${sources}
          <div class="rprice">${priceHtml}</div>
          <a class="btn" href="${esc(bookingHref)}" rel="nofollow sponsored">View on Booking</a>
        </div>
      </article>`;
    }

    /* ---------- Mapbox GL: one pin per hotel with coordinates ---------- */
    // `cancelled` guards against React StrictMode's double effect-invoke in dev
    // (mount → cleanup → mount again) racing two fetches/maps into the same DOM.
    let cancelled = false;
    const mapWrapEl = document.getElementById("mapWrap");
    let mapInstance = null;

    function hideMap() {
      if (mapWrapEl) mapWrapEl.style.display = "none";
    }
    function showMapMessage(text) {
      if (!mapWrapEl) return;
      if (mapInstance) { try { mapInstance.remove(); } catch (e) {} mapInstance = null; }
      mapWrapEl.style.display = "block";
      mapWrapEl.innerHTML = `<div class="map-msg">${esc(text)}</div>`;
    }
    function highlightCard(id) {
      document.querySelectorAll(".rcard.highlight").forEach((el) => el.classList.remove("highlight"));
      const card = document.querySelector(`.rcard[data-hotel-id="${window.CSS && CSS.escape ? CSS.escape(String(id)) : id}"]`);
      if (card) card.classList.add("highlight");
    }
    // Otellerin nearbyAttractions'ları çakışır (aynı yer birden fazla otele yakın olabilir) — tekilleştir.
    function collectAttractions(hotelList) {
      const seen = new Set();
      const list = [];
      hotelList.forEach((h) => {
        (h.nearbyAttractions || []).forEach((a) => {
          if (typeof a.latitude !== "number" || typeof a.longitude !== "number") return;
          const key = `${a.name}|${a.latitude.toFixed(5)}|${a.longitude.toFixed(5)}`;
          if (seen.has(key)) return;
          seen.add(key);
          list.push(a);
        });
      });
      return list;
    }
    async function initMap(hotelList) {
      const withCoords = hotelList.filter((h) => typeof h.latitude === "number" && typeof h.longitude === "number");
      if (!withCoords.length) { hideMap(); return; }
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) { showMapMessage("Map is unavailable right now."); return; }
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        if (cancelled) return;
        if (mapWrapEl) { mapWrapEl.style.display = "block"; mapWrapEl.innerHTML = '<div id="hotelMap"></div>'; }
        mapboxgl.accessToken = token;
        const map = new mapboxgl.Map({
          container: "hotelMap",
          style: "mapbox://styles/mapbox/light-v11",
          center: [withCoords[0].longitude, withCoords[0].latitude],
          zoom: 12,
        });
        mapInstance = map;
        map.addControl(new mapboxgl.NavigationControl(), "top-right");
        map.on("error", (e) => {
          console.error("Mapbox error:", e && e.error);
          if (!cancelled) showMapMessage("Map couldn't be loaded.");
        });
        map.on("load", () => {
          if (cancelled || mapInstance !== map) return; // stale/removed instance
          const bounds = new mapboxgl.LngLatBounds();
          withCoords.forEach((h) => {
            const marker = new mapboxgl.Marker({ color: "#0077b6" }).setLngLat([h.longitude, h.latitude]).addTo(map);
            const el = marker.getElement();
            el.style.cursor = "pointer";
            el.addEventListener("click", () => highlightCard(h.id));
            bounds.extend([h.longitude, h.latitude]);
          });
          const attractions = collectAttractions(hotelList);
          attractions.forEach((a) => {
            const marker = new mapboxgl.Marker({ color: "#f59e0b" })
              .setLngLat([a.longitude, a.latitude])
              .setPopup(new mapboxgl.Popup({ offset: 18, closeButton: false }).setText(a.name))
              .addTo(map);
            marker.getElement().style.cursor = "pointer";
            bounds.extend([a.longitude, a.latitude]);
          });
          if (withCoords.length + attractions.length > 1) {
            map.fitBounds(bounds, { padding: 48, maxZoom: 15, duration: 0 });
          }
        });
      } catch (err) {
        console.error("Mapbox init failed:", err);
        if (!cancelled) showMapMessage("Map couldn't be loaded.");
      }
    }

    let SD = null;
    try { SD = JSON.parse(sessionStorage.getItem("staylo_search") || "null"); } catch (e) { SD = null; }
    const F = SD && SD.filters ? SD.filters : null;
    if (F && F.weights && typeof F.weights === "object") WEIGHTS = F.weights;
    if (!F) { window.location.replace("/search"); }
    else {
      renderMessage("Searching for hotels…", false);
      renderHeader(null);
      hideMap();
      const payload = {
        checkIn: F.checkIn,
        checkOut: F.checkOut,
        guests: F.guests || 2,
        city: F.city,
        country: F.country,
      };
      if (F.weights && typeof F.weights === "object") payload.weights = F.weights;
      if (F.budget && (F.budget.min != null || F.budget.max != null)) {
        payload.budget = { min: F.budget.min, max: F.budget.max, currency: F.budget.currency || "EUR" };
      }
      const controller = new AbortController();
      fetch("/api/hotels", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: controller.signal })
        .then(async (res) => {
          if (cancelled) return;
          const data = await res.json().catch(() => ({}));
          if (cancelled) return;
          if (!res.ok) { renderMessage(data.error || "We couldn't fetch hotels right now. Please try again in a moment.", true); hideMap(); return; }
          const hotels = Array.isArray(data.hotels) ? data.hotels : [];
          if (!hotels.length) { renderMessage("No hotels found for this search. Try adjusting your dates or budget.", false); hideMap(); return; }
          if (resultsEl) resultsEl.innerHTML = hotels.map((h, i) => hotelCardHtml(h, i + 1)).join("");
          renderHeader(hotels);
          setupFavorites(hotels);
          initMap(hotels);
        })
        .catch((err) => { if (!cancelled && err.name !== "AbortError") renderMessage("Network error. Please check your connection and try again.", true); if (!cancelled) hideMap(); });

      return () => {
        cancelled = true;
        controller.abort();
        if (mapInstance) { try { mapInstance.remove(); } catch (e) {} mapInstance = null; }
      };
    }

    return () => { cancelled = true; if (mapInstance) { try { mapInstance.remove(); } catch (e) {} mapInstance = null; } };
    /* eslint-enable */
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div dangerouslySetInnerHTML={{ __html: BODY }} />
    </>
  );
}