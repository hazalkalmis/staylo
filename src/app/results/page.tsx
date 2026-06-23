// @ts-nocheck
"use client";

import { useEffect } from "react";

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

  .results{margin-top:26px;display:flex;flex-direction:column;gap:18px;position:relative;z-index:3;}
  .rcard{background:#fff;border:1px solid var(--border);border-radius:18px;overflow:hidden;
         box-shadow:0 30px 70px -56px rgba(3,4,94,0.5);display:grid;grid-template-columns:228px 1fr 210px;}
  .rthumb{position:relative;}
  .rthumb .rthumb-ph{position:absolute;inset:0;display:block;}
  .rthumb .rank{position:absolute;top:14px;left:14px;z-index:5;width:34px;height:34px;border-radius:9px;
                background:rgba(3,4,94,0.86);color:#fff;font-size:14px;font-weight:700;
                display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);}
  .rmid{padding:24px 28px;display:flex;flex-direction:column;border-left:1px solid var(--border);border-right:1px solid var(--border);}
  .rname{font-size:22px;font-weight:600;letter-spacing:-0.025em;color:var(--ink);}
  .rmeta{font-size:13px;color:var(--muted);margin-top:5px;}
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

  @media(max-width:880px){.rcard{grid-template-columns:1fr;}.rthumb{height:180px;}.rmid{border:none;border-top:1px solid var(--border);border-bottom:1px solid var(--border);}.ribbon{flex-wrap:wrap;}.rib{flex:1 1 33%;}}

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
    <a href="/landing.html" class="logo"><span class="w">stayl</span><span class="sq"><span class="h l"></span><span class="h r"></span><span class="o oL">o</span><span class="o oR">o</span></span></a>
    <div class="nav-right">
      <a href="#" class="login">Log in</a>
      <a href="#" class="btn">Saved</a>
    </div>
  </div>
</nav>

<!-- ===== HEADER (sky) + CARD ===== -->
<div class="skyband">
  <div class="cloud-layer" data-zone="head"></div>
  <div class="rhead wrap">
    <div class="reyebrow"><span class="dot"></span>Step 3 of 4 · Your ranked answer</div>
    <h1>Walkable boutique stay near the <span style="white-space:nowrap"><span class="stamp">Colosseum</span>,</span> quiet, under €220.</h1>
    <p class="rsub">We read <b>4,120 reviews</b> across <b>23 matching hotels</b> in Rome and scored each on your priorities. Here are the top three.</p>
    <div class="rfilters">
      <span class="wtag">Safety<b>25%</b></span>
      <span class="wtag">Quiet<b>25%</b></span>
      <span class="wtag">Walkability<b>20%</b></span>
      <span class="wtag">Value<b>15%</b></span>
      <span class="wtag">Cleanliness<b>10%</b></span>
      <span class="wtag">Family<b>5%</b></span>
      <a href="/filters" class="adjust-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"></path></svg>Adjust priorities</a>
    </div>
  </div>

  <div class="results wrap">
    <article class="rcard">
      <div class="rthumb"><span class="rank">#1</span><div class="rthumb-ph" style="background:linear-gradient(135deg,#bee1e6,#90e0ef)"></div></div>
      <div class="rmid">
        <div class="rname">Hotel Lumo Roma</div>
        <div class="rmeta">Monti · 7-min walk to the Colosseum · 1,842 reviews</div>
        <p class="rsumq"><span class="serif">“</span>Quiet rooms set back from the street, faultless staff, steps from the Forum.<span class="serif">”</span></p>
        <div class="ribbon">
          <div class="rib"><div class="nm">Safety <span class="wt">25%</span></div><div class="vl">9.4</div><div class="bar"><i data-v="9.4" style="width:94%"></i></div></div>
          <div class="rib"><div class="nm">Quiet <span class="wt">25%</span></div><div class="vl">9.5</div><div class="bar"><i data-v="9.5" style="width:95%"></i></div></div>
          <div class="rib"><div class="nm">Walk <span class="wt">20%</span></div><div class="vl">9.6</div><div class="bar"><i data-v="9.6" style="width:96%"></i></div></div>
          <div class="rib"><div class="nm">Value <span class="wt">15%</span></div><div class="vl">8.6</div><div class="bar"><i data-v="8.6" style="width:86%"></i></div></div>
          <div class="rib"><div class="nm">Clean <span class="wt">10%</span></div><div class="vl">9.5</div><div class="bar"><i data-v="9.5" style="width:95%"></i></div></div>
          <div class="rib"><div class="nm">Family <span class="wt">5%</span></div><div class="vl">8.7</div><div class="bar"><i data-v="8.7" style="width:87%"></i></div></div>
        </div>
      </div>
      <div class="rrail">
        <div class="rbadge" data-v="9.3">9.3</div>
        <div class="rblabel">Staylo fit <span class="info">i<span class="tip">Computed from Google + Booking reviews, weighted by the priorities you chose.</span></span></div>
        <div class="rsrc">
          <span class="src-row"><span class="src-glyph b">B</span><span class="src-line"><b>8.9</b></span></span>
          <span class="src-row"><span class="src-glyph g">G</span><span class="src-line"><b>4.6</b></span></span>
        </div>
        <div class="rprice">€186<span> /night</span></div>
        <a href="#" class="btn">View on Booking →</a>
      </div>
    </article>

    <article class="rcard">
      <div class="rthumb"><span class="rank">#2</span><div class="rthumb-ph" style="background:linear-gradient(135deg,#caf0f8,#a9d8e8)"></div></div>
      <div class="rmid">
        <div class="rname">Palazzo Undici</div>
        <div class="rmeta">Celio · 9-min walk to the Colosseum · 1,204 reviews</div>
        <p class="rsumq"><span class="serif">“</span>Charming boutique rooms and a calm courtyard; breakfast gets a special mention.<span class="serif">”</span></p>
        <div class="ribbon">
          <div class="rib"><div class="nm">Safety <span class="wt">25%</span></div><div class="vl">8.9</div><div class="bar"><i data-v="8.9" style="width:89%"></i></div></div>
          <div class="rib"><div class="nm">Quiet <span class="wt">25%</span></div><div class="vl">8.6</div><div class="bar"><i data-v="8.6" style="width:86%"></i></div></div>
          <div class="rib"><div class="nm">Walk <span class="wt">20%</span></div><div class="vl">9.1</div><div class="bar"><i data-v="9.1" style="width:91%"></i></div></div>
          <div class="rib"><div class="nm">Value <span class="wt">15%</span></div><div class="vl">8.8</div><div class="bar"><i data-v="8.8" style="width:88%"></i></div></div>
          <div class="rib"><div class="nm">Clean <span class="wt">10%</span></div><div class="vl">9.0</div><div class="bar"><i data-v="9.0" style="width:90%"></i></div></div>
          <div class="rib"><div class="nm">Family <span class="wt">5%</span></div><div class="vl">8.4</div><div class="bar"><i data-v="8.4" style="width:84%"></i></div></div>
        </div>
      </div>
      <div class="rrail">
        <div class="rbadge" data-v="8.7">8.7</div>
        <div class="rblabel">Staylo fit <span class="info">i<span class="tip">Computed from Google + Booking reviews, weighted by the priorities you chose.</span></span></div>
        <div class="rsrc">
          <span class="src-row"><span class="src-glyph b">B</span><span class="src-line"><b>8.5</b></span></span>
          <span class="src-row"><span class="src-glyph g">G</span><span class="src-line"><b>4.4</b></span></span>
        </div>
        <div class="rprice">€164<span> /night</span></div>
        <a href="#" class="btn">View on Booking →</a>
      </div>
    </article>

    <article class="rcard">
      <div class="rthumb"><span class="rank">#3</span><div class="rthumb-ph" style="background:linear-gradient(135deg,#dfeef0,#bee1e6)"></div></div>
      <div class="rmid">
        <div class="rname">Monti Garden Rooms</div>
        <div class="rmeta">Monti · 11-min walk to the Colosseum · 968 reviews</div>
        <p class="rsumq"><span class="serif">“</span>Great value in a lively area; some guests note evening noise from nearby bars.<span class="serif">”</span></p>
        <div class="ribbon">
          <div class="rib"><div class="nm">Safety <span class="wt">25%</span></div><div class="vl">8.3</div><div class="bar"><i data-v="8.3" style="width:83%"></i></div></div>
          <div class="rib"><div class="nm">Quiet <span class="wt">25%</span></div><div class="vl">7.6</div><div class="bar"><i data-v="7.6" style="width:76%"></i></div></div>
          <div class="rib"><div class="nm">Walk <span class="wt">20%</span></div><div class="vl">8.8</div><div class="bar"><i data-v="8.8" style="width:88%"></i></div></div>
          <div class="rib"><div class="nm">Value <span class="wt">15%</span></div><div class="vl">9.2</div><div class="bar"><i data-v="9.2" style="width:92%"></i></div></div>
          <div class="rib"><div class="nm">Clean <span class="wt">10%</span></div><div class="vl">8.6</div><div class="bar"><i data-v="8.6" style="width:86%"></i></div></div>
          <div class="rib"><div class="nm">Family <span class="wt">5%</span></div><div class="vl">8.0</div><div class="bar"><i data-v="8.0" style="width:80%"></i></div></div>
        </div>
      </div>
      <div class="rrail">
        <div class="rbadge" data-v="8.1">8.1</div>
        <div class="rblabel">Staylo fit <span class="info">i<span class="tip">Computed from Google + Booking reviews, weighted by the priorities you chose.</span></span></div>
        <div class="rsrc">
          <span class="src-row"><span class="src-glyph b">B</span><span class="src-line"><b>8.2</b></span></span>
          <span class="src-row"><span class="src-glyph g">G</span><span class="src-line"><b>4.3</b></span></span>
        </div>
        <div class="rprice">€132<span> /night</span></div>
        <a href="#" class="btn">View on Booking →</a>
      </div>
    </article>
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
    <a href="/landing.html" class="logo"><span class="w" style="font-size:24px">stayl</span><span class="sq" style="width:26px;height:26px"><span class="h l"></span><span class="h r"></span><span class="o oL" style="font-size:20px">o</span><span class="o oR" style="font-size:20px">o</span></span></a>
    <span style="font-size:11.5px;">© 2026 Staylo · Powered by Booking.com inventory</span>
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

    /* ---------- blue score scale: deepest = best, fading lighter ---------- */
    function blueScale(v) {
      const stops = [[7.0, [144, 224, 239]], [7.8, [72, 202, 228]], [8.4, [0, 180, 216]],
                     [8.9, [0, 119, 182]], [9.3, [3, 69, 122]], [9.7, [3, 4, 94]]];
      v = Math.max(stops[0][0], Math.min(stops[stops.length - 1][0], v));
      let a = stops[0], b = stops[stops.length - 1];
      for (let i = 0; i < stops.length - 1; i++) { if (v >= stops[i][0] && v <= stops[i + 1][0]) { a = stops[i]; b = stops[i + 1]; break; } }
      const t = (v - a[0]) / ((b[0] - a[0]) || 1);
      const c = a[1].map((x, i) => Math.round(x + (b[1][i] - x) * t));
      return `rgb(${c[0]},${c[1]},${c[2]})`;
    }
    document.querySelectorAll('.rbadge[data-v]').forEach(el => { el.style.background = blueScale(parseFloat(el.dataset.v)); });
    document.querySelectorAll('.rib .bar i[data-v]').forEach(el => { el.style.background = blueScale(parseFloat(el.dataset.v)); });
    /* eslint-enable */
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div dangerouslySetInnerHTML={{ __html: BODY }} />
    </>
  );
}