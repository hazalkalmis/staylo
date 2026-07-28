// @ts-nocheck
"use client";

import { useEffect } from "react";
import { wireAuthNav } from "@/lib/authNav";

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

  :root{
    --ink:#03045e; --body:#33506a; --muted:#6f8a9c; --faint:#9fb4c2;
    --border:#e4edf3; --surface:#ffffff; --surface-2:#f3f9fc;
    --ocean:#0077b6; --sky:#90e0ef; --pale:#caf0f8; --cyan:#00b4d8; --deep:#03457a;
    --good:#2f9e6a; --warn:#d6a32a; --bad:#d2603f;
  }
  *{box-sizing:border-box;}
  html,body{margin:0;padding:0;}
  body{font-family:'Geist',system-ui,sans-serif;background:#fff;color:var(--body);
       line-height:1.55;-webkit-font-smoothing:antialiased;}
  a{color:inherit;text-decoration:none;}
  .wrap{max-width:1200px;margin:0 auto;padding:0 40px;}
  .serif{font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-weight:400;}

  /* logo */
  .logo{display:inline-flex;align-items:center;}
  .logo .w{font-weight:700;letter-spacing:-0.05em;color:var(--ink);}
  .logo .sq{display:flex;align-items:center;justify-content:center;transform:rotate(-4deg);
            position:relative;overflow:hidden;border-radius:3px;margin-left:0.07em;}
  .logo .sq .h{position:absolute;top:0;height:100%;width:50%;}
  .logo .sq .h.l{left:0;background:var(--sky);}
  .logo .sq .h.r{right:0;background:var(--ink);}
  .logo .o{position:absolute;z-index:2;font-weight:700;letter-spacing:-0.05em;line-height:1;
           left:50%;top:50%;transform:translate(-50%,-53%);}
  .logo .o.oL{color:#fff;clip-path:inset(0 50% 0 0);}
  .logo .o.oR{color:#fff;clip-path:inset(0 0 0 50%);}
  /* size variants */
  .logo.lg .w{font-size:30px;} .logo.lg .sq{width:32px;height:32px;} .logo.lg .o{font-size:25px;}

  /* nav */
  nav{position:sticky;top:0;z-index:50;background:rgba(255,255,255,0.72);
      backdrop-filter:blur(12px);border-bottom:1px solid rgba(228,237,243,0.8);}
      .nav-row{display:flex;align-items:center;justify-content:space-between;padding:16px 40px;max-width:none;margin:0;}
  .nav-links{display:flex;gap:30px;font-size:15px;font-weight:500;color:var(--muted);}
  .nav-links a:hover{color:var(--ink);}
  .nav-right{display:flex;align-items:center;gap:20px;}
  .login{font-size:15px;font-weight:600;color:var(--ink);}
  .btn{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--ink);
       background:var(--ink);color:#fff;padding:11px 20px;border-radius:11px;
       font:600 14.5px 'Geist',sans-serif;cursor:pointer;transition:background 120ms;}
  .btn:hover{background:#06075f;}
  .btn--ghost{background:rgba(255,255,255,0.6);color:var(--ink);border-color:#bcd6e4;}
  .btn--ghost:hover{background:#fff;}
  .btn--lg{padding:15px 28px;font-size:16px;border-radius:12px;}

  /* sky + clouds */
  .sky{position:relative;overflow:hidden;
       background:linear-gradient(180deg,#d2ebf6 0%,#e2f3fb 40%,#f0f9fd 72%,#fff 100%);}
  .cloud-layer{position:absolute;inset:0;pointer-events:none;z-index:1;}
  .cloud{position:absolute;will-change:transform;}
  .cloud svg{display:block;}
  @keyframes drift{from{transform:translateX(-22px);}to{transform:translateX(22px);}}

  /* hero */
  .hero{position:relative;z-index:3;padding:70px 0 110px;}
  .eyebrow{display:inline-flex;align-items:center;gap:9px;font-size:13px;font-weight:600;
           letter-spacing:0.08em;text-transform:uppercase;color:var(--ocean);margin-bottom:26px;}
  .eyebrow .dot{width:7px;height:7px;border-radius:50%;background:var(--cyan);}
  h1{font-size:clamp(48px,7.2vw,88px);font-weight:700;letter-spacing:-0.04em;line-height:1.0;
     margin:0;max-width:1040px;color:var(--ink);text-wrap:balance;}
  .stamp{display:inline-block;background:var(--ocean);color:#fff;padding:2px 16px 8px;border-radius:5px;}
  .hero-sub{font-size:20px;color:var(--body);max-width:660px;margin:30px 0 0;line-height:1.5;}
  .hero-sub sup{color:var(--ocean);font-weight:700;}
  .hero-source{font-size:12.5px;color:var(--faint);margin-top:6px;letter-spacing:0.01em;}
  .hero-cta{display:flex;gap:14px;margin-top:38px;align-items:center;flex-wrap:wrap;}
  .trust{margin-top:30px;display:inline-flex;align-items:center;gap:0;flex-wrap:wrap;
         background:rgba(255,255,255,0.65);border:1px solid #c7e0ee;border-radius:999px;
         padding:11px 8px;font-size:15px;font-weight:600;color:var(--ink);}
  .trust span{padding:0 18px;}
  .trust span + span{border-left:1px solid #bcd9e8;}
  .trust .lead{color:var(--ocean);}

  /* section scaffolding */
  section.block{padding:104px 0;}
  .white{position:relative;overflow:hidden;background:#fff;}
  .tint{background:var(--surface-2);}
  /* sky band: open patch of sky framed by white, top & bottom */
  .skyband{position:relative;overflow:hidden;
    background:linear-gradient(180deg,#ffffff 0%,#e0f2fb 22%,#cfe9f6 50%,#e0f2fb 78%,#ffffff 100%);}
  .block .wrap{position:relative;z-index:3;}
  .skyband .sec-eyebrow{color:#3f7d99;} .skyband .sec-eyebrow b{color:var(--ocean);}
  .sec-eyebrow{font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);font-weight:700;}
  .sec-eyebrow b{color:var(--ocean);font-weight:700;}
  h2{font-size:clamp(34px,4.8vw,54px);font-weight:700;letter-spacing:-0.03em;line-height:1.05;
     color:var(--ink);margin:10px 0 0;text-wrap:balance;}
  h2 .serif{color:var(--cyan);}
  .sec-lead{font-size:18px;color:var(--body);max-width:620px;margin-top:18px;line-height:1.55;position:relative;z-index:3;}

  /* product preview */
  .preview{position:relative;z-index:3;margin-top:54px;border-radius:18px;overflow:hidden;
           border:1px solid var(--border);background:#fff;
           box-shadow:0 40px 90px -50px rgba(3,4,94,0.35);}
  .pv-bar{display:flex;align-items:center;gap:7px;padding:12px 16px;border-bottom:1px solid var(--border);background:#fbfdfe;}
  .pv-bar .d{width:11px;height:11px;border-radius:50%;background:#d6e3ec;}
  .pv-bar .url{flex:1;text-align:center;font-size:12px;color:var(--muted);font-family:ui-monospace,monospace;}
  .pv-body{padding:30px;display:grid;grid-template-columns:1fr 320px;gap:22px;}
  .pv-results{display:flex;flex-direction:column;gap:12px;}
  .pv-card{display:grid;grid-template-columns:104px 1fr auto;gap:18px;padding:14px;
           background:#fff;border:1px solid var(--border);border-radius:12px;align-items:center;}
  .pv-thumb{width:104px;height:78px;border-radius:8px;background:#eef5f9;position:relative;overflow:hidden;}
  .pv-thumb::after{content:attr(data-l);position:absolute;left:8px;bottom:6px;font:11px ui-monospace,monospace;color:#9bb3c2;}
  .pv-name{font-size:15px;font-weight:600;color:var(--ink);}
  .pv-meta{font-size:12px;color:var(--muted);margin-top:4px;}
  .badge{width:54px;height:54px;border-radius:11px;display:flex;align-items:center;justify-content:center;
         color:#fff;font-size:19px;font-weight:700;letter-spacing:-0.02em;}
  .badge.good{background:var(--good);} .badge.warn{background:var(--warn);}
  .pv-side{background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:20px;}
  .pv-side .h{font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--ocean);font-weight:700;margin-bottom:8px;}
  .pv-side h4{margin:0 0 16px;font-size:17px;font-weight:600;color:var(--ink);}
  .pv-row{display:flex;align-items:center;gap:10px;margin-bottom:12px;font-size:12px;}
  .pv-row .lab{width:64px;color:var(--muted);}
  .pv-row .trk{flex:1;height:5px;border-radius:3px;background:#e1ecf3;position:relative;}
  .pv-row .trk i{position:absolute;inset:0 auto 0 0;border-radius:3px;background:var(--ocean);}
  .pv-row .v{width:24px;text-align:right;font-family:ui-monospace,monospace;color:var(--body);}

  section.block{position:relative;overflow:hidden;}
  .white{position:relative;overflow:hidden;}
  .cl-on{position:relative;z-index:3;}

  /* compare */
  .compare{margin-top:48px;display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border);border:1px solid var(--border);border-radius:16px;overflow:hidden;position:relative;z-index:3;}
  .compare>div{background:#fff;padding:34px;}
  .compare h3{margin:0 0 16px;font-size:17px;font-weight:700;}
  .compare .col-bad h3{color:var(--bad);} .compare .col-good h3{color:var(--ink);}
  .compare ul{margin:0;padding:0;list-style:none;}
  .compare li{padding:14px 0;border-bottom:1px solid var(--border);display:flex;gap:13px;font-size:14.5px;line-height:1.5;color:var(--body);}
  .compare li:last-child{border-bottom:none;}
  .compare .col-good li{color:var(--ink);}
  .compare .mk{width:15px;height:15px;border-radius:4px;flex-shrink:0;margin-top:3px;}
  .mk.x{background:var(--bad);} .mk.v{background:var(--deep);}

  /* steps — journey (gradient ribbon, 4 nodes) */
  .jr{position:relative;margin-top:34px;height:392px;z-index:3;}
  .jr svg.path{position:absolute;inset:0;width:100%;height:100%;z-index:1;}
  .pt{position:absolute;width:220px;transform:translateX(-50%);text-align:center;z-index:2;}
  .pt h3{margin:0 0 6px;font-size:17px;font-weight:600;color:var(--ink);letter-spacing:-0.02em;}
  .pt p{margin:0;font-size:13px;color:var(--muted);line-height:1.5;}
  .pt .circ{width:88px;height:88px;border-radius:50%;margin:0 auto 13px;display:flex;align-items:center;justify-content:center;
            position:relative;color:#fff;box-shadow:0 18px 36px -14px rgba(3,69,122,0.7);}
  .pt .circ svg{width:40px;height:40px;}
  .pt:nth-child(2) .circ{background:linear-gradient(150deg,#48cae4,#0096c7);}
  .pt:nth-child(3) .circ{background:linear-gradient(150deg,#0096c7,#0077b6);}
  .pt:nth-child(4) .circ{background:linear-gradient(150deg,#0077b6,#03457a);}
  .pt:nth-child(5) .circ{background:linear-gradient(150deg,#03457a,#03045e);}
  .pt .circ .n{position:absolute;bottom:-6px;right:-6px;width:30px;height:30px;border-radius:50%;background:#fff;color:var(--ocean);
               font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 3px 8px rgba(3,4,94,0.2);}

  /* score */
  .score-row{margin-top:50px;display:grid;grid-template-columns:1.1fr 1fr;gap:50px;align-items:center;position:relative;z-index:3;}
  .score-demo{background:#fff;border:1px solid var(--border);border-radius:16px;padding:32px;box-shadow:0 30px 70px -50px rgba(3,4,94,0.3);}
  .score-head{display:flex;gap:18px;margin-bottom:6px;}
  .score-head .num{width:80px;height:80px;border-radius:14px;background:#0a5f97;color:#fff;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:700;letter-spacing:-0.03em;flex-shrink:0;}
  .score-head .nm{font-size:16px;font-weight:600;color:var(--ink);}
  .score-head .src{font-size:12.5px;color:var(--muted);margin-top:3px;}
  .score-head .cmp{font-size:12.5px;margin-top:9px;color:var(--body);}
  .score-head .cmp b{color:#0a5f97;font-weight:700;} .score-head .cmp .bk{color:var(--muted);}
  .factors{margin-top:14px;}
  .factor{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--border);}
  .factor:last-child{border-bottom:none;}
  .factor .name{width:140px;font-size:13.5px;color:var(--body);}
  .factor .trk{flex:1;height:6px;border-radius:3px;background:#e1ecf3;position:relative;}
  .factor .trk i{position:absolute;inset:0 auto 0 0;border-radius:3px;background:var(--good);}
  .factor .v{width:34px;text-align:right;font-size:12.5px;color:var(--muted);font-family:ui-monospace,monospace;}
  .scale-strip{margin-top:22px;height:14px;border-radius:7px;overflow:hidden;
    background:linear-gradient(90deg,#caf0f8 0%,#90e0ef 26%,#00b4d8 52%,#0077b6 78%,#03045e 100%);}
  .scale-labels{display:flex;justify-content:space-between;font-size:11.5px;color:var(--muted);margin-top:7px;font-family:ui-monospace,monospace;}
  .cc h3{margin:0;font-size:23px;font-weight:700;color:var(--ink);letter-spacing:-0.02em;}
  .cc p{margin-top:14px;color:var(--body);font-size:15.5px;line-height:1.6;}

  /* features */
  .features{margin-top:56px;display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:16px;overflow:hidden;position:relative;z-index:3;}
  .feature{background:#fff;padding:32px;}
  .feature .ic{width:38px;height:38px;border-radius:9px;background:var(--ink);display:flex;align-items:center;justify-content:center;margin-bottom:18px;}
  .feature .ic svg{width:20px;height:20px;stroke:#90e0ef;stroke-width:1.7;fill:none;}
  .feature h3{margin:0 0 10px;font-size:17px;font-weight:600;color:var(--ink);letter-spacing:-0.015em;}
  .feature p{margin:0;font-size:14.5px;color:var(--muted);line-height:1.55;}

  /* quote */
  .quote-block{padding:64px 48px;background:var(--surface-2);border:1px solid var(--border);border-radius:18px;text-align:center;position:relative;z-index:3;}
  .quote-block .qm{font-family:'Instrument Serif',Georgia,serif;font-size:80px;line-height:0.4;color:var(--cyan);display:block;margin-bottom:14px;}
  .quote-block blockquote{margin:0 auto;font-size:clamp(22px,2.4vw,30px);font-weight:500;letter-spacing:-0.015em;color:var(--ink);line-height:1.35;max-width:700px;text-wrap:balance;}
  .quote-block .by{margin-top:22px;font-size:13.5px;color:var(--muted);} .quote-block .by b{color:var(--ink);font-weight:600;}

  /* faq */
  .faq{margin-top:46px;border-top:1px solid var(--border);position:relative;z-index:3;}
  details{border-bottom:1px solid var(--border);}
  summary{list-style:none;padding:24px 0;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-size:18px;font-weight:600;color:var(--ink);letter-spacing:-0.015em;}
  summary::-webkit-details-marker{display:none;}
  summary::after{content:"+";color:var(--muted);font-size:24px;font-weight:300;transition:transform 200ms;}
  details[open] summary::after{transform:rotate(45deg);}
  details>p{margin:0;padding:0 0 24px;font-size:15.5px;color:var(--muted);line-height:1.6;max-width:720px;}

  /* cta */
  .cta{position:relative;overflow:hidden;background:var(--ink);color:#fff;padding:110px 0;text-align:center;}
  .cta h2{color:#fff;}
  .cta .stamp{background:var(--sky);color:var(--ink);}
  .cta p{color:rgba(255,255,255,0.7);max-width:560px;margin:24px auto 0;font-size:17px;}
  .cta .btn{background:#fff;color:var(--ink);border-color:#fff;} .cta .btn:hover{background:#eaf6fc;}
  .cta .btn--ghost{background:transparent;color:#fff;border-color:rgba(255,255,255,0.35);}

  /* footer */
  footer{padding:54px 0 40px;border-top:1px solid var(--border);font-size:13.5px;color:var(--muted);}
  .footer-row{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;}
  .footer-row .links{display:flex;gap:24px;}
  .footer-row a:hover{color:var(--ink);}

  @media(max-width:880px){.pv-body,.compare,.features,.score-row{grid-template-columns:1fr;}.nav-links{display:none;}
    .jr{height:auto;position:static;}.jr svg.path{display:none;}
    .pt{position:static!important;width:auto;transform:none;margin:0 auto 26px;max-width:300px;}}@media(max-width:520px){.nav-row{padding:12px 18px;}.nav-right{gap:11px;}.logo .w{font-size:24px;}.logo .sq{width:26px;height:26px;}.logo .o{font-size:20px;}.login{font-size:14px;white-space:nowrap;}.nav-right .btn{padding:9px 15px;font-size:13.5px;white-space:nowrap;}}

  /* ================= MOBILE LANDING REDESIGN (≤880px) ================= */
  /* A · nav — sadece logo + "Use Staylo" (referans) */
  @media(max-width:880px){
    .login{display:none;}
  }
  /* B · hero — başlık küçült, tutarlı yan boşluk, tam-genişlik butonlar, trust kartı */
  @media(max-width:880px){
    .wrap{padding:0 22px;}
    .hero{padding:40px 22px 52px;}
    h1{font-size:clamp(31px,8.4vw,42px);line-height:1.08;letter-spacing:-0.03em;max-width:none;}
    .stamp{padding:1px 12px 6px;border-radius:6px;}
    .hero-sub{font-size:17px;line-height:1.5;margin-top:20px;}
    .hero-source{margin-top:10px;}
    .hero-cta{flex-direction:column;align-items:stretch;gap:12px;margin-top:26px;}
    .hero-cta .btn{width:100%;justify-content:center;}
    /* trust → kenarlıklı kart: başlık + tek satır alt bilgi */
    .trust{flex-wrap:wrap;align-items:baseline;gap:0;margin-top:24px;
           border-radius:16px;padding:16px 18px;}
    .trust span{padding:0;}
    .trust span+span{border-left:none;}
    .trust .lead{flex-basis:100%;font-size:16px;margin-bottom:5px;}
    .trust span:not(.lead){font-size:13.5px;color:var(--body);font-weight:500;}
    .trust span:not(.lead)+span:not(.lead)::before{content:"·";color:var(--faint);margin:0 6px;}
  }
  /* C · preview → zengin dikey kartlar (mobil); masaüstünde gizli, browser-mockup korunur */
  .pvm{display:none;}
  @media(max-width:880px){
    .preview{display:none;}
    .pvm{display:block;margin-top:26px;}
    .pvm-card{background:#fff;border:1px solid var(--border);border-radius:18px;overflow:hidden;
              box-shadow:0 30px 70px -56px rgba(3,4,94,0.5);margin-bottom:18px;}
    .pvm-thumb{position:relative;height:200px;}
    .pvm-rank{position:absolute;top:14px;left:14px;width:36px;height:36px;border-radius:9px;
              background:rgba(3,4,94,0.86);color:#fff;font-size:14px;font-weight:700;
              display:flex;align-items:center;justify-content:center;}
    .pvm-fav{position:absolute;top:12px;right:12px;width:36px;height:36px;border-radius:50%;
             background:rgba(255,255,255,0.92);display:flex;align-items:center;justify-content:center;
             box-shadow:0 3px 10px rgba(3,4,94,0.25);}
    .pvm-fav svg{width:19px;height:19px;fill:none;stroke:var(--ink);stroke-width:2;}
    .pvm-score{position:relative;z-index:6;margin:-44px 14px 0;padding:13px 15px;background:#fff;
               border-radius:14px;box-shadow:0 12px 30px -14px rgba(3,4,94,0.3);
               display:flex;align-items:center;gap:14px;}
    .pvm-badge{width:58px;height:58px;border-radius:13px;color:#fff;font-size:23px;font-weight:700;
               display:flex;align-items:center;justify-content:center;flex-shrink:0;letter-spacing:-0.03em;}
    .pvm-fit{font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--ocean);font-weight:700;line-height:1.4;}
    .pvm-fit span{display:block;font-size:12px;letter-spacing:0;text-transform:none;color:var(--muted);font-weight:400;margin-top:2px;}
    .pvm-fit b{color:var(--ink);font-weight:600;}
    .pvm-name{font-size:24px;font-weight:600;letter-spacing:-0.025em;color:var(--ink);padding:16px 18px 0;}
    .pvm-meta{font-size:13px;color:var(--muted);padding:5px 18px 0;}
    .pvm-quote{font-size:14px;color:var(--body);padding:12px 18px 0;line-height:1.5;}
    .pvm-metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;padding:16px 18px;}
    .pvm-m{border:1px solid var(--border);border-radius:9px;padding:8px 2px;text-align:center;
           display:flex;flex-direction:column;gap:2px;}
    .pvm-m span{font-size:8.5px;letter-spacing:0.03em;color:var(--muted);font-weight:600;}
    .pvm-m b{font-size:14px;color:var(--ink);font-weight:600;font-family:ui-monospace,monospace;}
    .pvm-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;
              padding:14px 18px 18px;border-top:1px solid var(--border);}
    .pvm-price{font-size:22px;font-weight:700;color:var(--ink);letter-spacing:-0.02em;white-space:nowrap;}
    .pvm-price span{font-size:12px;color:var(--muted);font-weight:400;}
    .pvm-btn{display:inline-flex;align-items:center;background:var(--ink);color:#fff;border-radius:11px;
             padding:13px 18px;font-size:14.5px;font-weight:600;white-space:nowrap;}
    .pvm-cap{text-align:center;font-size:13px;color:var(--muted);margin:4px 0 0;font-style:italic;}
  }
  /* D · bölüm cilası — mobilde daha sıkı boşluk + tipografi (yapısal değişiklik yok) */
  @media(max-width:880px){
    section.block{padding:56px 0;}
    h2{font-size:clamp(27px,7.4vw,36px);}
    .sec-lead{font-size:16px;margin-top:14px;}
    .compare{margin-top:28px;}
    .compare>div{padding:22px;}
    .compare li{font-size:14px;}
    .score-row{margin-top:30px;gap:26px;}
    .score-demo{padding:22px;}
    .features{margin-top:30px;}
    .feature{padding:24px;}
    .quote-block{padding:40px 24px;}
    .quote-block .qm{font-size:60px;}
    .faq{margin-top:28px;}
    .cta{padding:64px 0;}
    .cta p{font-size:16px;}
    .cta .cl-on>div{flex-direction:column;align-items:stretch;}
    .cta .btn{width:100%;justify-content:center;}
    footer{padding:36px 0 30px;}
    .footer-row{flex-direction:column;align-items:flex-start;gap:16px;}
  }
  /* ML-END */`;

const BODY = `
<!-- ===== NAV ===== -->
<nav>
  <div class="wrap nav-row">
    <a href="/" class="logo lg"><span class="w">stayl</span><span class="sq"><span class="h l"></span><span class="h r"></span><span class="o oL">o</span><span class="o oR">o</span></span></a>
    <div class="nav-links">
      <a href="#how">How it works</a>
      <a href="#score">The score</a>
      <a href="#faq">FAQ</a>
    </div>
    <div class="nav-right">
      <a href="/login" class="login">Log in</a>
      <a href="/search" class="btn">Use Staylo</a>
    </div>
  </div>
</nav>

<!-- ===== HERO (sky) ===== -->
<div class="sky">
  <div class="cloud-layer" data-zone="hero"></div>
  <header class="hero wrap">
    <div class="eyebrow"><span class="dot"></span>AI hotel search · live across 1.2M+ properties</div>
    <h1><span class="stamp">One search.</span><br>Every review read.<br>Every hotel scored.</h1>
    <p class="hero-sub">The average traveler spends 5+ hours<sup>*</sup> across dozens of sites to book one stay. Staylo does it in seconds. Say where you're going, set a few filters, and every hotel comes back read, scored, and ranked for what you actually care about. Save the hours. Skip the stress.</p>
    <p class="hero-source">* Source: Expedia Group Path to Purchase research.</p>
    <div class="hero-cta">
      <a href="/search" class="btn btn--lg">Start a search</a>
      <a href="#how" class="btn btn--ghost btn--lg">See how it works</a>
    </div>
    <div class="trust"><span class="lead">Find the right stay in Staylo</span><span>Book on Booking.com</span><span>No extra commission</span><span>Ranked in seconds</span></div>
  </header>
</div>

<!-- ===== PRODUCT PREVIEW ===== -->
<section class="block white" style="padding-top:70px;">
  <div class="cloud-layer" data-zone="prev"></div>
  <div class="wrap">
    <div class="preview">
      <div class="pv-bar"><span class="d"></span><span class="d"></span><span class="d"></span>
        <span class="url">staylo.app/search?q=quiet+family+hotel+barcelona</span></div>
      <div class="pv-body">
        <div class="pv-results">
          <div class="pv-card"><div class="pv-thumb" data-l="hotel photo"></div>
            <div><div class="pv-name">Hotel Casa Bonay</div>
              <div class="pv-meta">Eixample · 8 min walk · 1,842 reviews · €178/night</div></div>
            <div class="badge" style="background:#03457a">9.2</div></div>
          <div class="pv-card"><div class="pv-thumb" data-l="hotel photo"></div>
            <div><div class="pv-name">Praktik Bakery</div>
              <div class="pv-meta">Eixample · 12 min walk · 956 reviews · €148/night</div></div>
            <div class="badge" style="background:#0077b6">8.7</div></div>
          <div class="pv-card"><div class="pv-thumb" data-l="hotel photo"></div>
            <div><div class="pv-name">Hotel Brummell</div>
              <div class="pv-meta">Poble-sec · 18 min walk · 612 reviews · €164/night</div></div>
            <div class="badge" style="background:#3f9fd0">7.9</div></div>
        </div>
        <aside class="pv-side">
          <div class="h">Why these rank</div>
          <h4>Weighted for your trip</h4>
          <div class="pv-row"><span class="lab">Quiet</span><span class="trk"><i style="width:78%"></i></span><span class="v">78</span></div>
          <div class="pv-row"><span class="lab">Family</span><span class="trk"><i style="width:64%"></i></span><span class="v">64</span></div>
          <div class="pv-row"><span class="lab">Walkable</span><span class="trk"><i style="width:88%"></i></span><span class="v">88</span></div>
          <div class="pv-row"><span class="lab">Clean</span><span class="trk"><i style="width:92%"></i></span><span class="v">92</span></div>
          <div class="pv-row"><span class="lab">Value</span><span class="trk"><i style="width:55%"></i></span><span class="v">55</span></div>
        </aside>
      </div>
    </div>
    <!-- mobile-only zengin kartlar (masaüstünde .pvm gizli) -->
    <div class="pvm">
      <article class="pvm-card">
        <div class="pvm-thumb" style="background:#dbeaf1 url('/demo/casa-bonay.jpg') center/cover">
          <span class="pvm-rank">#1</span>
          <span class="pvm-fav"><svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></span>
        </div>
        <div class="pvm-score">
          <div class="pvm-badge" style="background:linear-gradient(150deg,#0096c7,#03457a)">9.2</div>
          <div class="pvm-fit">Staylo fit<span>Booking <b>8.4</b> · Google <b>4.6</b></span></div>
        </div>
        <div class="pvm-name">Hotel Casa Bonay</div>
        <div class="pvm-meta">Eixample · 8-min walk · 1,842 reviews</div>
        <div class="pvm-quote">“Quiet rooms, faultless staff, steps from everything we needed.”</div>
        <div class="pvm-metrics">
          <div class="pvm-m"><span>QUIET</span><b>9.1</b></div>
          <div class="pvm-m"><span>FAMILY</span><b>8.8</b></div>
          <div class="pvm-m"><span>WALK</span><b>9.4</b></div>
          <div class="pvm-m"><span>CLEAN</span><b>9.6</b></div>
          <div class="pvm-m"><span>VALUE</span><b>8.2</b></div>
        </div>
        <div class="pvm-foot"><div class="pvm-price">€178<span> /night</span></div><a class="pvm-btn" href="/search">View on Booking →</a></div>
      </article>
      <article class="pvm-card">
        <div class="pvm-thumb" style="background:#dbeaf1 url('/demo/praktik-bakery.jpg') center/cover">
          <span class="pvm-rank">#2</span>
          <span class="pvm-fav"><svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></span>
        </div>
        <div class="pvm-score">
          <div class="pvm-badge" style="background:linear-gradient(150deg,#00b4d8,#0077b6)">8.7</div>
          <div class="pvm-fit">Staylo fit<span>Booking <b>8.5</b> · Google <b>4.4</b></span></div>
        </div>
        <div class="pvm-name">Praktik Bakery</div>
        <div class="pvm-meta">Eixample · 12-min walk · 956 reviews</div>
        <div class="pvm-quote">“Charming rooms, great breakfast, calm despite the busy street below.”</div>
        <div class="pvm-metrics">
          <div class="pvm-m"><span>QUIET</span><b>8.6</b></div>
          <div class="pvm-m"><span>FAMILY</span><b>8.2</b></div>
          <div class="pvm-m"><span>WALK</span><b>9.0</b></div>
          <div class="pvm-m"><span>CLEAN</span><b>9.1</b></div>
          <div class="pvm-m"><span>VALUE</span><b>8.8</b></div>
        </div>
        <div class="pvm-foot"><div class="pvm-price">€148<span> /night</span></div><a class="pvm-btn" href="/search">View on Booking →</a></div>
      </article>
      <article class="pvm-card">
        <div class="pvm-thumb" style="background:#dbeaf1 url('/demo/brummell.jpg') center/cover">
          <span class="pvm-rank">#3</span>
          <span class="pvm-fav"><svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></span>
        </div>
        <div class="pvm-score">
          <div class="pvm-badge" style="background:linear-gradient(150deg,#48cae4,#0096c7)">7.9</div>
          <div class="pvm-fit">Staylo fit<span>Booking <b>8.1</b> · Google <b>4.2</b></span></div>
        </div>
        <div class="pvm-name">Hotel Brummell</div>
        <div class="pvm-meta">Poble-sec · 18-min walk · 612 reviews</div>
        <div class="pvm-quote">“Rooftop pool is worth it alone; a longer walk but great value for the area.”</div>
        <div class="pvm-metrics">
          <div class="pvm-m"><span>QUIET</span><b>7.8</b></div>
          <div class="pvm-m"><span>FAMILY</span><b>7.6</b></div>
          <div class="pvm-m"><span>WALK</span><b>7.4</b></div>
          <div class="pvm-m"><span>CLEAN</span><b>8.8</b></div>
          <div class="pvm-m"><span>VALUE</span><b>9.0</b></div>
        </div>
        <div class="pvm-foot"><div class="pvm-price">€164<span> /night</span></div><a class="pvm-btn" href="/search">View on Booking →</a></div>
      </article>
      <p class="pvm-cap">A ranked list — this is what your search comes back with.</p>
    </div>
  </div>
</section>

<!-- ===== PROBLEM ===== -->
<section class="block skyband" id="problem">
  <div class="cloud-layer" data-zone="problem"></div>
  <div class="wrap">
    <div class="sec-eyebrow"><b>01.</b> The problem</div>
    <h2>Booking has the inventory.<br>It doesn't have the <span class="serif">decision</span>.</h2>
    <p class="sec-lead">Hotel sites give you 200 results, 40 filters, and three sorting options. You still close 12 tabs and pick the one with the best photo. Staylo replaces all of that with one weighted answer.</p>
    <div class="compare">
      <div class="col-bad">
        <h3>Standard hotel search</h3>
        <ul>
          <li><span class="mk x"></span>You translate your trip into 20+ checkboxes, and hope you ticked the right ones.</li>
          <li><span class="mk x"></span>For every shortlisted hotel, you open the reviews tab and read for an hour: is it clean, is it safe, is it actually close, what did past guests really say?</li>
          <li><span class="mk x"></span>Sorting by "Top picks" hides the platform's bias behind a friendly default.</li>
          <li><span class="mk x"></span>An 8.4 from 4,000 reviewers and an 8.4 from 38 reviewers look identical, but one is signal and the other is noise. You're left guessing which.</li>
        </ul>
      </div>
      <div class="col-good">
        <h3>Staylo</h3>
        <ul>
          <li><span class="mk v"></span>You describe the trip in your own words. We extract the criteria (quiet, family, walkable, budget) automatically.</li>
          <li><span class="mk v"></span>We read every review for every hotel, across 4 languages, and score the things you asked about: clean, safe, close, quiet.</li>
          <li><span class="mk v"></span>Ranking is weighted by your priorities, not ours. You see the math, and the list rearranges accordingly when you adjust it.</li>
          <li><span class="mk v"></span>One score, blended from Booking and Google reviews and weighted by sample size, so a small-but-loud rating can't hide as a big number.</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ===== HOW IT WORKS ===== -->
<section class="block white" id="how">
  <div class="cloud-layer" data-zone="how"></div>
  <div class="wrap cl-on">
    <div class="sec-eyebrow"><b>02.</b> How it works</div>
    <h2>Four steps. <span class="serif">No filter avalanche.</span></h2>
    <div class="jr">
      <svg class="path" viewBox="0 0 1000 392" preserveAspectRatio="none">
        <defs><linearGradient id="rib" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#90e0ef"></stop><stop offset="0.4" stop-color="#00b4d8"></stop>
          <stop offset="0.7" stop-color="#0077b6"></stop><stop offset="1" stop-color="#03457a"></stop>
        </linearGradient></defs>
        <path d="M125 278 C 250 278 250 74 375 74 S 500 278 625 278 S 750 74 875 74" fill="none" stroke="url(#rib)" stroke-width="6" stroke-linecap="round" opacity="0.92"></path>
      </svg>
      <div class="pt" style="left:12.5%;top:234px;">
        <div class="circ"><span class="n">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"></path><path d="M8 10h8M8 13.5h5"></path></svg></div>
        <h3>Describe the trip</h3><p>Say it in plain language — as specific as you like.</p>
      </div>
      <div class="pt" style="left:37.5%;top:30px;">
        <div class="circ"><span class="n">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11M9 12h11M9 18h11"></path><path d="M3.5 6l1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2"></path></svg></div>
        <h3>Confirm the criteria</h3><p>We extract location, budget &amp; vibe — you fix anything.</p>
      </div>
      <div class="pt" style="left:62.5%;top:234px;">
        <div class="circ"><span class="n">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v3.5a5 5 0 0 1-10 0V4z"></path><path d="M7 6H4.2v.8a3 3 0 0 0 3 3M17 6h2.8v.8a3 3 0 0 1-3 3"></path><path d="M12 12.5V16M9 20h6M10 16.5h4"></path></svg></div>
        <h3>Get one ranked answer</h3><p>Every hotel read, scored and ranked on your priorities.</p>
      </div>
      <div class="pt" style="left:87.5%;top:30px;">
        <div class="circ"><span class="n">4</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2.5"></rect><path d="M3 9h18M8 2.5v4M16 2.5v4"></path><path d="M9 14.5l2 2 4-4"></path></svg></div>
        <h3>Book on Booking.com</h3><p>Same price — booked securely through Booking.com.</p>
      </div>
    </div>
  </div>
</section>

<!-- ===== SCORE ===== -->
<section class="block skyband" id="score">
  <div class="cloud-layer" data-zone="score"></div>
  <div class="wrap">
    <div class="sec-eyebrow"><b>03.</b> The Staylo score</div>
    <h2>One number.<br><span class="serif">Weighted for what you care about.</span></h2>
    <p class="sec-lead">Not a generic average. Each criterion you described becomes a weighted factor, blended across Booking and Google reviews and adjusted for sample size, so the score reflects real signal, not just a loud minority.</p>
    <div class="score-row">
      <div class="score-demo">
        <div class="score-head">
          <div class="num">9.2</div>
          <div>
            <div class="nm">Hotel Casa Bonay</div>
            <div class="src">Excellent fit · 1,842 reviews / Booking + Google</div>
            <div class="cmp"><b>Staylo fit 9.2</b> · <span class="bk">Booking score 8.4</span></div>
          </div>
        </div>
        <div class="factors">
          <div class="factor"><span class="name">Quiet at night</span><span class="trk"><i style="width:91%;background:#0a64a0"></i></span><span class="v">9.1</span></div>
          <div class="factor"><span class="name">Family-friendly</span><span class="trk"><i style="width:88%;background:#1c84bd"></i></span><span class="v">8.8</span></div>
          <div class="factor"><span class="name">Walkability</span><span class="trk"><i style="width:94%;background:#064f86"></i></span><span class="v">9.4</span></div>
          <div class="factor"><span class="name">Cleanliness</span><span class="trk"><i style="width:96%;background:#03457a"></i></span><span class="v">9.6</span></div>
          <div class="factor"><span class="name">Value</span><span class="trk"><i style="width:82%;background:#4aa6d1"></i></span><span class="v">8.2</span></div>
        </div>
      </div>
      <div class="cc">
        <h3>Color carries meaning.</h3>
        <p>9.2 reads instantly deeper than 7.4. Every score sits on one continuous blue scale — the deepest blue is the best fit, fading lighter as the score drops. No legend to learn, no math required.</p>
        <div class="scale-strip"></div>
        <div class="scale-labels"><span>5.0</span><span>7.5</span><span>10.0</span></div>
      </div>
    </div>
  </div>
</section>

<!-- ===== FEATURES ===== -->
<section class="block white">
  <div class="cloud-layer" data-zone="features"></div>
  <div class="wrap">
    <div class="sec-eyebrow"><b>04.</b> Built differently</div>
    <h2>What you get with <span class="serif">every search</span>.</h2>
    <div class="features">
      <div class="feature"><div class="ic"><svg viewBox="0 0 24 24"><path d="M12 3 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z"></path></svg></div>
        <h3>Reads every review</h3><p>Across English, Spanish, French, German. Not summaries: the actual themes, with quotes.</p></div>
      <div class="feature"><div class="ic"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18"></rect><path d="M8 13 l3 3 5-7"></path></svg></div>
        <h3>Weighted ranking</h3><p>Drag a slider, watch the list re-sort. The number is yours, not the platform's.</p></div>
      <div class="feature"><div class="ic"><svg viewBox="0 0 24 24"><path d="M12 2 L4 11 12 22 20 11 Z"></path></svg></div>
        <h3>Smart on location</h3><p>"Walkable to the old town" becomes a real radius. POIs, transit, walk times, built in.</p></div>
      <div class="feature"><div class="ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M8 12 l3 3 5-6"></path></svg></div>
        <h3>Same price as Booking</h3><p>You book through Booking.com at parity. We make money from them, not you.</p></div>
      <div class="feature"><div class="ic"><svg viewBox="0 0 24 24"><path d="M3 18 V8 H11 V14 H21 V18"></path><line x1="3" y1="14" x2="21" y2="14"></line></svg></div>
        <h3>Honest about gaps</h3><p>If a criterion has no data, we say so, instead of inventing a confident-looking number.</p></div>
      <div class="feature"><div class="ic"><svg viewBox="0 0 24 24"><line x1="3" y1="7" x2="21" y2="7"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="17" x2="21" y2="17"></line></svg></div>
        <h3>What we filtered out</h3><p>You see the rejects too: 218 hotels outside radius, 142 with no pool, so the answer is auditable.</p></div>
    </div>
  </div>
</section>

<!-- ===== TESTIMONIAL ===== -->
<section class="block skyband">
  <div class="cloud-layer" data-zone="testi"></div>
  <div class="wrap">
    <div class="quote-block"><span class="qm">"</span>
      <blockquote>I described the trip once. Got a ranked list with quotes from real reviews. Booked the second result. Best hotel decision I've made in years.</blockquote>
      <div class="by"><b>Mira K.</b> · Travel writer · Berlin</div>
    </div>
  </div>
</section>

<!-- ===== FAQ ===== -->
<section class="block white" id="faq">
  <div class="cloud-layer" data-zone="faq"></div>
  <div class="wrap">
    <div class="sec-eyebrow"><b>05.</b> Questions</div>
    <h2>Things people <span class="serif">actually ask.</span></h2>
    <div class="faq">
      <details><summary>Is Staylo a hotel booking site?</summary>
        <p>No. Staylo is a search and ranking layer. We use Booking.com's inventory and prices; you complete the booking with them, at the same rate, with the same cancellation terms.</p></details>
      <details><summary>How do you make money if it's free?</summary>
        <p>Booking.com pays us a referral fee for completed bookings. That fee comes out of their margin, never from you. You pay the same price you'd pay going direct.</p></details>
      <details><summary>Can the score be gamed?</summary>
        <p>Hotels can't pay for placement. Reviews come from Booking and Google and a few other public sources; the weighting is yours, not ours. We publish our scoring methodology in full.</p></details>
      <details><summary>What languages are supported?</summary>
        <p>Search: English and Turkish today, Spanish, French and German next quarter. Review analysis: English, Spanish, French, German, covering ~85% of European review volume.</p></details>
      <details><summary>How current are the reviews?</summary>
        <p>We re-read reviews continuously. A hotel's score reflects the latest review volume, not a snapshot from last year.</p></details>
    </div>
  </div>
</section>

<!-- ===== CTA ===== -->
<section class="cta">
  <div class="cloud-layer" data-zone="cta"></div>
  <div class="wrap cl-on">
    <h2>Stop opening tabs.<br><span class="stamp">Start booking the right one.</span></h2>
    <p>One search across every hotel. Same prices, weighted the way you actually think.</p>
    <div style="margin-top:36px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <a href="/search" class="btn btn--lg">Use Staylo</a>
      <a href="#how" class="btn btn--ghost btn--lg">How it works</a>
    </div>
  </div>
</section>

<!-- ===== FOOTER ===== -->
<footer>
  <div class="wrap footer-row">
    <span class="logo lg"><span class="w">stayl</span><span class="sq"><span class="h l"></span><span class="h r"></span><span class="o oL">o</span><span class="o oR">o</span></span></span>
    <div class="links"><a href="#how">How it works</a><a href="#score">The score</a><a href="#faq">FAQ</a><a href="/search">Try it</a></div>
    <span style="font-size:11.5px;letter-spacing:0.02em;">© 2026 Staylo · Reviews from Google · Bookings via Booking.com</span>
  </div>
</footer>
`;

export default function Home() {
  useEffect(() => {
    /* eslint-disable */
    let UID = 0;
    // Volumetric cloud built only from soft ellipses (renders reliably everywhere):
    // a cluster of bright puffs, each with a translucent cool shadow nestled on its
    // lower-right (sun from upper-left) so every puff has its own lit top + shaded
    // underside — internal volume, not a flat base. Jittered per cloud = all unique.
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
      // a soft shadow on the lower-right underside of each puff
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
      hero: { color: WHITE_CLOUD, list: [
        { l: "46%", t: "-2%", type: "cumulus", w: 560, h: 255, o: 1, d: 80 },
        { l: "-4%", t: "30%", type: "cumulus", w: 430, h: 200, o: 0.95, d: 90 },
        { l: "72%", t: "50%", type: "cumulus", w: 370, h: 172, o: 0.88, d: 82 },
        { l: "30%", t: "14%", type: "cumulus", w: 210, h: 108, o: 0.52, d: 60 },
        { l: "60%", t: "63%", type: "cumulus", w: 230, h: 116, o: 0.62, d: 66 },
      ]},
      /* white bands → one soft, sparse blue cloud */
      prev: { color: BLUE_CLOUD, list: [
        { l: "70%", t: "6%", type: "cumulus", w: 340, h: 160, o: 0.34, d: 80 },
      ]},
      how: { color: BLUE_CLOUD, list: [
        { l: "-4%", t: "44%", type: "cumulus", w: 300, h: 140, o: 0.28, d: 82 },
      ]},
      features: { color: BLUE_CLOUD, list: [
        { l: "78%", t: "44%", type: "cumulus", w: 300, h: 140, o: 0.28, d: 80 },
      ]},
      faq: { color: BLUE_CLOUD, list: [
        { l: "-4%", t: "10%", type: "cumulus", w: 300, h: 140, o: 0.26, d: 84 },
      ]},
      /* sky bands → soft white cumulus, lightly layered */
      problem: { color: WHITE_CLOUD, list: [
        { l: "57%", t: "-3%", type: "cumulus", w: 480, h: 220, o: 0.94, d: 80 },
        { l: "-5%", t: "46%", type: "cumulus", w: 330, h: 155, o: 0.74, d: 88 },
      ]},
      score: { color: WHITE_CLOUD, list: [
        { l: "60%", t: "-2%", type: "cumulus", w: 470, h: 215, o: 0.92, d: 82 },
        { l: "-6%", t: "50%", type: "cumulus", w: 320, h: 150, o: 0.72, d: 90 },
      ]},
      testi: { color: WHITE_CLOUD, list: [
        { l: "55%", t: "-3%", type: "cumulus", w: 460, h: 210, o: 0.9, d: 78 },
        { l: "4%", t: "46%", type: "cumulus", w: 320, h: 150, o: 0.72, d: 90 },
      ]},
      cta: { color: WHITE_CLOUD, list: [
        { l: "62%", t: "6%", type: "cumulus", w: 460, h: 210, o: 0.14, d: 82 },
        { l: "-7%", t: "40%", type: "cumulus", w: 380, h: 180, o: 0.1, d: 90 },
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
    /* eslint-enable */
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div dangerouslySetInnerHTML={{ __html: BODY }} />
    </>
  );
}
