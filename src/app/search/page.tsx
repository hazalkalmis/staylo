// @ts-nocheck
"use client";

import { useEffect } from "react";
import { wireAuthNav } from "@/lib/authNav";

const CSS = "@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');\n\n  :root{\n    --ink:#03045e; --body:#33506a; --muted:#6f8a9c; --faint:#9fb4c2;\n    --border:#e4edf3; --surface:#ffffff; --surface-2:#f3f9fc;\n    --ocean:#0077b6; --sky:#90e0ef; --pale:#caf0f8; --cyan:#00b4d8;\n  }\n  *{box-sizing:border-box;}\n  html,body{margin:0;padding:0;}\n  body{font-family:'Geist',system-ui,sans-serif;background:#fff;color:var(--body);\n       line-height:1.55;-webkit-font-smoothing:antialiased;}\n  a{color:inherit;text-decoration:none;}\n  .wrap{max-width:1160px;margin:0 auto;padding:0 40px;position:relative;z-index:3;}\n  .serif{font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-weight:400;}\n\n  /* logo */\n  .logo{display:inline-flex;align-items:center;}\n  .logo .w{font-weight:700;letter-spacing:-0.05em;color:var(--ink);font-size:30px;}\n  .logo .sq{display:flex;align-items:center;justify-content:center;transform:rotate(-4deg);\n            position:relative;overflow:hidden;border-radius:3px;margin-left:0.07em;width:32px;height:32px;}\n  .logo .sq .h{position:absolute;top:0;height:100%;width:50%;}\n  .logo .sq .h.l{left:0;background:var(--sky);}\n  .logo .sq .h.r{right:0;background:var(--ink);}\n  .logo .o{position:absolute;z-index:2;font-weight:700;letter-spacing:-0.05em;line-height:1;\n           left:50%;top:50%;transform:translate(-50%,-53%);font-size:25px;}\n  .logo .o.oL{color:#fff;clip-path:inset(0 50% 0 0);}\n  .logo .o.oR{color:#fff;clip-path:inset(0 0 0 50%);}\n\n  /* nav */\n  nav{position:sticky;top:0;z-index:50;background:rgba(255,255,255,0.72);\n      backdrop-filter:blur(12px);border-bottom:1px solid rgba(228,237,243,0.8);}\n  .nav-row{max-width:none;margin:0;padding:16px 40px;display:flex;align-items:center;justify-content:space-between;}\n  .nav-links{display:flex;gap:30px;font-size:15px;font-weight:500;color:var(--muted);}\n  .nav-links a:hover{color:var(--ink);}\n  .nav-right{display:flex;align-items:center;gap:20px;}\n  .login{font-size:15px;font-weight:600;color:var(--ink);}\n  .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--ink);\n       background:var(--ink);color:#fff;padding:12px 22px;border-radius:11px;\n       font:600 14.5px 'Geist',sans-serif;cursor:pointer;transition:background 120ms;}\n  .btn:hover{background:#06075f;}\n  .btn--ghost{background:rgba(255,255,255,0.7);color:var(--ink);border-color:var(--ink);}\n  .btn--ghost:hover{background:#fff;}\n  .btn--lg{padding:15px 26px;font-size:16px;border-radius:12px;}\n\n  /* sky + clouds */\n  .skyband{position:relative;overflow:hidden;\n    background:linear-gradient(180deg,#cfe9f6 0%,#dcf1fb 46%,#eef9fd 78%,#ffffff 100%);}\n  .white{position:relative;overflow:hidden;background:#fff;}\n  .cloud-layer{position:absolute;inset:0;pointer-events:none;z-index:1;}\n  .cloud{position:absolute;will-change:transform;}\n  .cloud svg{display:block;}\n  @keyframes drift{from{transform:translateX(-20px);}to{transform:translateX(20px);}}\n\n  /* header */\n  header.head{position:relative;z-index:3;padding:54px 40px 30px;}\n  .eyebrow{display:inline-flex;align-items:center;gap:9px;font-size:12px;font-weight:700;\n           letter-spacing:0.14em;text-transform:uppercase;color:var(--ocean);margin-bottom:18px;}\n  .eyebrow .dot{width:7px;height:7px;border-radius:50%;background:var(--cyan);}\n  h1{font-size:clamp(34px,4.6vw,52px);font-weight:700;letter-spacing:-0.035em;line-height:1.04;\n     margin:0;color:var(--ink);max-width:820px;text-wrap:balance;}\n  .stamp{display:inline-block;background:var(--ocean);color:#fff;padding:0 14px 5px;border-radius:6px;line-height:1.04;}\n  .sub{font-size:17px;color:var(--body);max-width:600px;margin:18px 0 0;}\n\n  /* search-entry hero */\n  .hero{position:relative;z-index:3;text-align:center;padding:64px 40px 12px;}\n  .hero h1{font-size:clamp(42px,6.4vw,86px);font-weight:800;letter-spacing:-0.045em;line-height:0.98;\n           margin:0 auto;max-width:none;color:var(--ink);}\n  .hero h1 .stamp{display:inline-block;background:var(--ocean);color:#fff;padding:2px 22px 12px;border-radius:9px;\n                  transform:rotate(-2deg);margin-top:10px;white-space:nowrap;}\n  .searchwrap{max-width:820px;margin:42px auto 0;position:relative;z-index:3;}\n  .searchbox{background:#fff;border:1px solid var(--border);border-radius:18px;\n             box-shadow:0 40px 90px -54px rgba(3,4,94,0.45);padding:28px 30px 22px;text-align:left;}\n  .searchbox textarea{width:100%;border:none;outline:none;resize:none;background:transparent;\n                      font:400 19px/1.5 'Geist',sans-serif;color:var(--ink);}\n  .searchbox textarea::placeholder{color:var(--faint);}\n  .searchbox .divider{height:1px;background:var(--border);margin:6px 0 16px;}\n  .searchbox .sb-foot{display:flex;align-items:center;justify-content:space-between;gap:14px;}\n  .searchbox .hint{font-size:13px;color:var(--muted);}\n  .searchbox .hint b{color:var(--ocean);font-weight:600;}\n  .hp-field{position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;}\n  .chips{max-width:980px;margin:18px auto 0;display:flex;flex-wrap:wrap;justify-content:center;gap:10px;position:relative;z-index:3;}\n  .chip{font-size:13.5px;color:var(--body);background:rgba(255,255,255,0.85);border:1px solid var(--border);\n        border-radius:11px;padding:10px 15px;cursor:pointer;white-space:nowrap;transition:border-color 120ms,color 120ms,background 120ms;}\n  .chip:hover{border-color:var(--ocean);color:var(--ink);background:#fff;}\n\n  /* card */\n  .card{position:relative;z-index:3;background:#fff;border:1px solid var(--border);border-radius:18px;\n        box-shadow:0 40px 90px -54px rgba(3,4,94,0.4);margin:34px 0 0;overflow:hidden;}\n  .card-pad{padding:30px 34px;}\n  .card + .card{margin-top:18px;}\n  .card-head{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin-bottom:4px;}\n  .card-head h2{font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);font-weight:700;margin:0;}\n  .pill{font-size:12px;font-weight:600;color:var(--ocean);background:var(--surface-2);border:1px solid var(--border);\n        border-radius:999px;padding:5px 12px;}\n\n  /* fields grid */\n  .fields{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border);\n          border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-top:16px;}\n  .field{background:#fff;padding:15px 18px;}\n  .field label{display:block;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-bottom:7px;}\n  .field input{width:100%;border:none;outline:none;background:transparent;font:500 16px 'Geist',sans-serif;color:var(--ink);letter-spacing:-0.01em;}\n  .field input::placeholder{color:var(--faint);font-weight:400;}\n\n  /* weights */\n  .wlist{margin-top:18px;display:flex;flex-direction:column;gap:18px;}\n  .wrow{display:grid;grid-template-columns:150px 1fr 48px;align-items:center;gap:16px;}\n  .wrow .wl{font-size:14px;font-weight:500;color:var(--ink);}\n  .wrow .wl small{display:block;font-size:11px;font-weight:400;color:var(--faint);letter-spacing:0;margin-top:1px;}\n  .wrow .wv{font-size:14px;font-weight:600;color:var(--ink);font-family:ui-monospace,monospace;text-align:right;}\n  .slider{position:relative;height:22px;display:flex;align-items:center;}\n  .slider .trk{position:absolute;left:0;right:0;height:6px;border-radius:3px;background:#e1ecf3;}\n  .slider .fill{position:absolute;left:0;height:6px;border-radius:3px;background:var(--ocean);}\n  .slider input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:22px;background:transparent;margin:0;position:relative;z-index:2;cursor:ew-resize;}\n  .slider input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:#fff;border:2px solid var(--ocean);box-shadow:0 2px 6px rgba(3,4,94,0.22);cursor:ew-resize;}\n  .slider input[type=range]::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;border:2px solid var(--ocean);box-shadow:0 2px 6px rgba(3,4,94,0.22);cursor:ew-resize;}\n  .wfoot{margin-top:18px;display:flex;justify-content:space-between;align-items:center;\n         padding-top:16px;border-top:1px solid var(--border);}\n  .wfoot .tip{font-size:12.5px;color:var(--muted);}\n  .actions{display:flex;gap:10px;}\n\n  /* extra flat sky before the sea photo */\n  .sky-extend{height:96px;background:linear-gradient(180deg,#eef9fd 0%,#e9f6fc 100%);position:relative;z-index:2;}\n  /* steps */\n  .steps-sec{position:relative;overflow:hidden;padding:36px 0 90px;\n    background:url(\"/staylo-steps-bg.png\") center top / cover no-repeat;}\n  .steps-sec::before{content:\"\";position:absolute;inset:0;z-index:0;pointer-events:none;\n    background:linear-gradient(180deg, #e9f6fc 0%, rgba(233,246,252,0.92) 6%, rgba(236,245,251,0.6) 18%, rgba(248,251,254,0.42) 38%, rgba(255,255,255,0.66) 70%, rgba(255,255,255,0.74) 100%);}\n  .steps-sec .wrap{position:relative;z-index:3;}\n  /* steps \u2014 journey (gradient ribbon, 4 nodes) */\n  .jr{position:relative;margin-top:8px;height:392px;z-index:3;}\n  .jr svg.path{position:absolute;inset:0;width:100%;height:100%;z-index:1;}\n  .pt{position:absolute;width:220px;transform:translateX(-50%);text-align:center;z-index:2;}\n  .pt h3{margin:0 0 6px;font-size:17px;font-weight:600;color:var(--ink);letter-spacing:-0.02em;}\n  .pt p{margin:0;font-size:13px;color:var(--muted);line-height:1.5;}\n  .pt .circ{width:88px;height:88px;border-radius:50%;margin:0 auto 13px;display:flex;align-items:center;justify-content:center;\n            position:relative;color:#fff;box-shadow:0 18px 36px -14px rgba(3,69,122,0.7);}\n  .pt .circ svg{width:40px;height:40px;}\n  /* active / current step */\n  .pt .circ.done{box-shadow:0 0 0 4px #fff, 0 0 0 8px var(--cyan), 0 18px 36px -14px rgba(3,69,122,0.7);}\n  .pt .circ.done .n{background:var(--cyan);border-color:#fff;}\n  .pt .circ.done .n svg{width:18px;height:18px;}\n  .nowtag{display:inline-block;vertical-align:middle;margin-left:8px;font-size:10.5px;font-weight:700;letter-spacing:0.08em;\n          text-transform:uppercase;color:#fff;background:var(--cyan);border-radius:999px;padding:3px 9px;white-space:nowrap;}\n  .pt:nth-child(2) .circ{background:linear-gradient(150deg,#48cae4,#0096c7);}\n  .pt:nth-child(3) .circ{background:linear-gradient(150deg,#0096c7,#0077b6);}\n  .pt:nth-child(4) .circ{background:linear-gradient(150deg,#0077b6,#03457a);}\n  .pt:nth-child(5) .circ{background:linear-gradient(150deg,#03457a,#03045e);}\n  .pt .circ .n{position:absolute;bottom:-6px;right:-6px;width:30px;height:30px;border-radius:50%;background:#fff;color:var(--ocean);\n               font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 3px 8px rgba(3,4,94,0.2);}\n\n  /* footer */\n  footer{padding:40px 0;border-top:1px solid var(--border);font-size:13px;color:var(--muted);background:#fff;}\n  .footer-row{max-width:1160px;margin:0 auto;padding:0 40px;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;}\n\n  @media(max-width:880px){.fields{grid-template-columns:1fr;}.nav-links{display:none;}.wrow{grid-template-columns:120px 1fr 42px;}\n    .jr{height:auto;position:static;}.jr svg.path{display:none;}\n    .pt{position:static!important;width:auto;transform:none;margin:0 auto 26px;max-width:300px;}}\n";

const BODY = "\n\n\n\n<!-- ===== NAV ===== -->\n<nav>\n  <div class=\"nav-row\">\n    <a href=\"/\" class=\"logo\"><span class=\"w\">stayl</span><span class=\"sq\"><span class=\"h l\"></span><span class=\"h r\"></span><span class=\"o oL\">o</span><span class=\"o oR\">o</span></span></a>\n    <div class=\"nav-links\">\n      <a href=\"/#how\">How it works</a>\n      <a href=\"/#score\">The score</a>\n      <a href=\"/#faq\">FAQ</a>\n    </div>\n    <div class=\"nav-right\">\n      <a href=\"/login\" class=\"login\">Log in</a>\n      <a href=\"/saved\" class=\"btn\">Saved</a>\n    </div>\n  </div>\n</nav>\n\n<!-- ===== HEADER (sky) + CARD ===== -->\n<div class=\"skyband\">\n  <div class=\"cloud-layer\" data-zone=\"head\"></div>\n  <div class=\"hero\">\n    <h1><span class=\"stamp\">One search.</span><br>Every review read.<br>Every hotel scored.</h1>\n  </div>\n\n  <div class=\"searchwrap\">\n    <div class=\"searchbox\">\n      <textarea rows=\"2\" placeholder=\"Describe the stay you want\u2026 e.g. quiet family hotel in Barcelona, mid-June, walkable to old town, around \u20ac180\"></textarea>\n      <input class=\"hp-field\" type=\"text\" name=\"company\" tabindex=\"-1\" autocomplete=\"off\" aria-hidden=\"true\">\n      <div class=\"divider\"></div>\n      <div class=\"sb-foot\">\n        <span class=\"hint\">Plain language \u2014 we extract the criteria. <b>Press Search</b>.</span>\n        <button id=\"searchBtn\" type=\"button\" class=\"btn\">Search →</button>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"chips\">\n    <span class=\"chip\">Safe family hotel in Barcelona</span>\n    <span class=\"chip\">Quiet hotel near Eiffel Tower</span>\n    <span class=\"chip\">Rooftop pool in Lisbon under \u20ac200</span>\n    <span class=\"chip\">Walkable to old town in Prague</span>\n  </div>\n\n  <div class=\"sky-extend\"></div>\n</div>\n\n<!-- ===== 4-STEP EXPLAINER ===== -->\n<section class=\"steps-sec\">\n  <div class=\"wrap\">\n    <div class=\"jr\">\n      <svg class=\"path\" viewBox=\"0 0 1000 392\" preserveAspectRatio=\"none\">\n        <defs><linearGradient id=\"rib\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\">\n          <stop offset=\"0\" stop-color=\"#90e0ef\"></stop><stop offset=\"0.4\" stop-color=\"#00b4d8\"></stop>\n          <stop offset=\"0.7\" stop-color=\"#0077b6\"></stop><stop offset=\"1\" stop-color=\"#03457a\"></stop>\n        </linearGradient></defs>\n        <path d=\"M125 278 C 250 278 250 74 375 74 S 500 278 625 278 S 750 74 875 74\" fill=\"none\" stroke=\"url(#rib)\" stroke-width=\"6\" stroke-linecap=\"round\" opacity=\"0.92\"></path>\n      </svg>\n      <div class=\"pt\" style=\"left:12.5%;top:234px;\">\n        <div class=\"circ done\"><span class=\"n\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"3.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12.5l4.5 4.5L19 7\"></path></svg></span><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z\"></path><path d=\"M8 10h8M8 13.5h5\"></path></svg></div>\n        <h3>Describe the trip <span class=\"nowtag\">You're here</span></h3><p>Type it like you'd tell a friend \u2014 plain language.</p>\n      </div>\n      <div class=\"pt\" style=\"left:37.5%;top:30px;\">\n        <div class=\"circ\"><span class=\"n\">2</span><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 6h11M9 12h11M9 18h11\"></path><path d=\"M3.5 6l1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2\"></path></svg></div>\n        <h3>Confirm the criteria</h3><p>Location, dates, budget &amp; vibe \u2014 fix anything.</p>\n      </div>\n      <div class=\"pt\" style=\"left:62.5%;top:234px;\">\n        <div class=\"circ\"><span class=\"n\">3</span><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M7 4h10v3.5a5 5 0 0 1-10 0V4z\"></path><path d=\"M7 6H4.2v.8a3 3 0 0 0 3 3M17 6h2.8v.8a3 3 0 0 1-3 3\"></path><path d=\"M12 12.5V16M9 20h6M10 16.5h4\"></path></svg></div>\n        <h3>Get one ranked answer</h3><p>Every hotel read, scored and ranked for you.</p>\n      </div>\n      <div class=\"pt\" style=\"left:87.5%;top:30px;\">\n        <div class=\"circ\"><span class=\"n\">4</span><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"4.5\" width=\"18\" height=\"16\" rx=\"2.5\"></rect><path d=\"M3 9h18M8 2.5v4M16 2.5v4\"></path><path d=\"M9 14.5l2 2 4-4\"></path></svg></div>\n        <h3>Book on Booking.com</h3><p>Same price \u2014 booked securely through Booking.com.</p>\n      </div>\n    </div>\n  </div>\n</section>\n\n<!-- ===== FOOTER ===== -->\n<footer>\n  <div class=\"footer-row\">\n    <a href=\"/\" class=\"logo\"><span class=\"w\" style=\"font-size:24px\">stayl</span><span class=\"sq\" style=\"width:26px;height:26px\"><span class=\"h l\"></span><span class=\"h r\"></span><span class=\"o oL\" style=\"font-size:20px\">o</span><span class=\"o oR\" style=\"font-size:20px\">o</span></span></a>\n    <span style=\"font-size:11.5px;\">\u00a9 2026 Staylo \u00b7 Reviews from Google &amp; Tripadvisor \u00b7 Bookings via Booking.com</span>\n  </div>\n</footer>\n\n\n\n\n";

export default function SearchPage() {
  useEffect(() => {
    /* eslint-disable */
    /* ---------- weights (interactive, rebalancing) ---------- */
    const WEIGHTS=[
      {id:"safety",label:"Safety & area",hint:"Verified neighbourhood + recent reviews",w:25},
      {id:"quiet", label:"Quietness",    hint:"Noise mentions across reviews",        w:25},
      {id:"walk",  label:"Walkability",  hint:"Distance to centre + transit",         w:20},
      {id:"value", label:"Value",        hint:"Price vs. quality vs. location",       w:15},
      {id:"clean", label:"Cleanliness",  hint:"Housekeeping mentions",                w:10},
      {id:"family",label:"Family fit",   hint:"Cribs, space, kid amenities",          w:5},
    ];
    const wrapEl=document.getElementById('weights');
    if(wrapEl){
    function renderWeights(){
      wrapEl.innerHTML=WEIGHTS.map(x=>`
        <div class="wrow">
          <div class="wl">${x.label}<small>${x.hint}</small></div>
          <div class="slider">
            <div class="trk"></div><div class="fill" data-fill="${x.id}" style="width:${x.w}%"></div>
            <input type="range" min="0" max="100" value="${x.w}" data-id="${x.id}"/>
          </div>
          <div class="wv" data-val="${x.id}">${x.w}%</div>
        </div>`).join("");
      wrapEl.querySelectorAll('input[type=range]').forEach(inp=>{
        inp.addEventListener('input',()=>setWeight(inp.dataset.id,parseInt(inp.value,10)));
      });
    }
    function setWeight(id,v){
      const others=WEIGHTS.filter(w=>w.id!==id);
      const oldSum=others.reduce((s,w)=>s+w.w,0)||1;
      const remain=100-v;
      WEIGHTS.forEach(w=>{ w.w = w.id===id ? v : Math.max(0,Math.round(w.w*remain/oldSum)); });
      // fix rounding drift onto the largest "other"
      const drift=100-WEIGHTS.reduce((s,w)=>s+w.w,0);
      if(drift!==0){ const t=others.sort((a,b)=>b.w-a.w)[0]; if(t) t.w+=drift; }
      WEIGHTS.forEach(w=>{
        const f=wrapEl.querySelector(`[data-fill="${w.id}"]`); if(f) f.style.width=w.w+"%";
        const vv=wrapEl.querySelector(`[data-val="${w.id}"]`); if(vv) vv.textContent=w.w+"%";
        const rg=wrapEl.querySelector(`input[data-id="${w.id}"]`); if(rg && w.id!==id) rg.value=w.w;
      });
    }
    renderWeights();
    }
    
    /* ---------- clouds ---------- */
    let UID=0;
    function realCloud(w,h,type,color){
      const id="c"+(UID++);
      const seed=Math.floor(Math.random()*9000)+1;
      const [r,g,b]=color.map(v=>Math.round(v*255));
      const col=`rgb(${r},${g},${b})`;
      const sh=`rgb(${Math.round(r*0.70)},${Math.round(g*0.78)},${Math.round(b*0.90)})`;
      const J=(v,a)=>v+(Math.random()*2-1)*a;
      const Z=(v)=>v*(0.82+Math.random()*0.40);
      let base;
      if(type==="streak"){
        base=[[0.5,0.5,0.42,0.11],[0.30,0.52,0.16,0.07],[0.70,0.47,0.18,0.07],[0.5,0.5,0.30,0.06]];
      }else{
        base=[[0.32,0.50,0.20,0.18],[0.50,0.40,0.245,0.225],[0.66,0.49,0.205,0.185],
              [0.43,0.55,0.16,0.14],[0.60,0.56,0.15,0.125],[0.25,0.55,0.13,0.115],
              [0.78,0.55,0.12,0.105]];
      }
      const lumps=base.map(([cx,cy,rx,ry])=>[J(cx,0.035),J(cy,0.028),Z(rx),Z(ry)]);
      const body=lumps.map(([cx,cy,rx,ry])=>
        `<ellipse cx="${(w*cx).toFixed(1)}" cy="${(h*cy).toFixed(1)}" rx="${(w*rx).toFixed(1)}" ry="${(h*ry).toFixed(1)}" fill="url(#g${id})"/>`).join("");
      const shade=lumps.map(([cx,cy,rx,ry])=>
        `<ellipse cx="${(w*(cx+rx*0.26)).toFixed(1)}" cy="${(h*(cy+ry*0.46)).toFixed(1)}" rx="${(w*rx*0.72).toFixed(1)}" ry="${(h*ry*0.64).toFixed(1)}" fill="url(#s${id})"/>`).join("");
      const dscale=type==="streak"?Math.round(h*0.18):Math.round(h*0.14);
      const blur=type==="streak"?3:2;
      const bf=type==="streak"?(0.013+Math.random()*0.004).toFixed(4)+" 0.02"
                              :(0.010+Math.random()*0.004).toFixed(4);
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
    const WHITE_CLOUD=[1,1,1];
    const BLUE_CLOUD=[0.64,0.84,0.95];
    const ZONES={
      head:{color:WHITE_CLOUD,list:[
        {l:"60%",t:"-2%",type:"cumulus",w:460,h:210,o:0.95,d:82},
        {l:"-5%",t:"24%",type:"cumulus",w:340,h:160,o:0.8,d:90},
        {l:"30%",t:"6%",type:"cumulus",w:200,h:104,o:0.5,d:62},
      ]},
      steps:{color:BLUE_CLOUD,list:[
        {l:"-4%",t:"10%",type:"cumulus",w:320,h:150,o:0.26,d:84},
        {l:"80%",t:"54%",type:"cumulus",w:280,h:132,o:0.22,d:80},
      ]},
    };
    function paintAll(){
      document.querySelectorAll('.cloud-layer').forEach(el=>{
        const z=ZONES[el.dataset.zone]; if(!z)return;
        el.innerHTML=z.list.map((c,i)=>{
          const svg=realCloud(c.w,c.h,c.type,z.color);
          const dir=i%2?"reverse":"normal";
          return `<div class="cloud" style="left:${c.l};top:${c.t};opacity:${c.o};animation:drift ${c.d}s ease-in-out ${dir} infinite alternate;">${svg}</div>`;
        }).join("");
      });
    }
    paintAll();
    wireAuthNav();

    /* ---------- turnstile: honeypot'un üstüne ikinci bot koruması katmanı ---------- */
    // NEXT_PUBLIC_ öneki sayesinde Next.js bunu build zamanında inline eder.
    const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
    let turnstileToken = "";
    if (TURNSTILE_SITE_KEY) {
      window.onTurnstileVerified = (token) => { turnstileToken = token; };
      window.onTurnstileExpired = () => { turnstileToken = ""; };
      window.onTurnstileError = () => { turnstileToken = ""; };

      const searchboxEl = document.querySelector(".searchbox");
      if (searchboxEl && !document.getElementById("turnstileWrap")) {
        const wrap = document.createElement("div");
        wrap.id = "turnstileWrap";
        wrap.style.margin = "10px 0 2px";
        const widget = document.createElement("div");
        widget.className = "cf-turnstile";
        widget.setAttribute("data-sitekey", TURNSTILE_SITE_KEY);
        widget.setAttribute("data-callback", "onTurnstileVerified");
        widget.setAttribute("data-expired-callback", "onTurnstileExpired");
        widget.setAttribute("data-error-callback", "onTurnstileError");
        widget.setAttribute("data-theme", "light");
        wrap.appendChild(widget);
        const divider = searchboxEl.querySelector(".divider");
        if (divider) searchboxEl.insertBefore(wrap, divider);
        else searchboxEl.appendChild(wrap);
      }
      if (!document.getElementById("turnstile-script")) {
        const s = document.createElement("script");
        s.id = "turnstile-script";
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
      }
    }
    function getTurnstileToken(){
      try {
        if (window.turnstile && typeof window.turnstile.getResponse === "function") {
          const t = window.turnstile.getResponse();
          if (t) return t;
        }
      } catch (e) {}
      return turnstileToken || "";
    }

    /* ---------- search -> /api/search -> /filters ---------- */
    const ta = document.querySelector(".searchbox textarea");
    const hpEl = document.querySelector(".hp-field");
    const btn = document.getElementById("searchBtn");
    const hintEl = document.querySelector(".searchbox .hint");
    const defaultHint = hintEl ? hintEl.innerHTML : "";
    let busy = false;
    function setHint(msg, isError){ if(!hintEl) return; hintEl.innerHTML = msg; hintEl.style.color = isError ? "#d94030" : ""; }
    function resetBtn(){ if(!btn) return; btn.textContent = "Search →"; btn.style.opacity = ""; btn.style.pointerEvents = ""; }
    async function runSearch(){
      const query = (ta && ta.value ? ta.value : "").trim();
      if(query.length < 2){ setHint("Please describe your stay first.", true); if(ta) ta.focus(); return; }
      const tsToken = getTurnstileToken();
      if(TURNSTILE_SITE_KEY && !tsToken){ setHint("Please wait a moment for verification to finish, then press Search again.", true); return; }
      if(busy) return; busy = true;
      if(btn){ btn.textContent = "Searching..."; btn.style.opacity = "0.7"; btn.style.pointerEvents = "none"; }
      setHint("Reading your request...", false);
      try{
        const res = await fetch("/api/search", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ query, hp: hpEl ? hpEl.value : "", turnstileToken: tsToken }) });
        const data = await res.json().catch(()=>({}));
        if(!res.ok){ setHint(data.error || "Something went wrong. Please try again.", true); busy = false; resetBtn(); return; }
        sessionStorage.setItem("staylo_search", JSON.stringify({ query, filters: data.filters, ts: Date.now() }));
        window.location.assign("/filters");
      }catch(e){ setHint("Network error. Please try again.", true); busy = false; resetBtn(); }
    }
    if(btn) btn.addEventListener("click", runSearch);
    if(ta) ta.addEventListener("keydown", (e)=>{ if(e.key === "Enter" && !e.shiftKey){ e.preventDefault(); runSearch(); } });
    if(ta) ta.addEventListener("input", ()=>{ if(!busy) setHint(defaultHint, false); });
    document.querySelectorAll(".chip").forEach(chip=>{ chip.addEventListener("click", ()=>{ if(ta){ ta.value = chip.textContent.trim(); ta.focus(); } runSearch(); }); });
    /* eslint-enable */
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div dangerouslySetInnerHTML={{ __html: BODY }} />
    </>
  );
}