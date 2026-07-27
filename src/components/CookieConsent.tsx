"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

// ----------------------------------------------------------------------------
// Cookie consent banner + consent-gated GA4.
// - Tercih localStorage'da: 'staylo-cookie-consent' = 'accepted' | 'declined'.
// - GA SADECE şu üçü de sağlanınca yüklenir: consent='accepted' + production +
//   NEXT_PUBLIC_GA_ID tanımlı. Accept öncesi gtag sayfaya HİÇ inmez.
// - Hydration-safe: mount olana kadar null render (SSR/CSR uyuşmazlığı olmasın).
// ----------------------------------------------------------------------------

const STORAGE_KEY = "staylo-cookie-consent";
type Consent = "accepted" | "declined" | null;

const CSS = `
  .staylo-cc{position:fixed;left:0;right:0;bottom:0;z-index:9999;
    display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;
    padding:16px 24px;background:#ffffff;border-top:1px solid #e4edf3;
    box-shadow:0 -4px 24px rgba(3,4,94,0.10);
    font-family:'Geist',system-ui,-apple-system,sans-serif;color:#33506a;
    animation:staylo-cc-up .28s ease;}
  @keyframes staylo-cc-up{from{transform:translateY(100%);}to{transform:translateY(0);}}
  @media (prefers-reduced-motion:reduce){.staylo-cc{animation:none;}}
  .staylo-cc-text{margin:0;font-size:14px;line-height:1.5;max-width:74ch;}
  .staylo-cc-text a{color:#0077b6;text-decoration:underline;font-weight:500;}
  .staylo-cc-actions{display:flex;gap:12px;flex-shrink:0;}
  .staylo-cc-btn{font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;
    border-radius:9px;padding:9px 22px;border:1px solid transparent;
    transition:background .15s,border-color .15s,color .15s;}
  .staylo-cc-btn.ghost{background:transparent;color:#6f8a9c;border-color:#e4edf3;}
  .staylo-cc-btn.ghost:hover{color:#03045e;border-color:#caf0f8;}
  .staylo-cc-btn.accept{background:#0077b6;color:#fff;}
  .staylo-cc-btn.accept:hover{background:#03457a;}
  @media (max-width:520px){
    .staylo-cc{flex-direction:column;align-items:stretch;gap:12px;padding:16px;}
    .staylo-cc-actions{justify-content:stretch;}
    .staylo-cc-btn{flex:1;}
  }`;

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [consent, setConsent] = useState<Consent>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "accepted" || v === "declined") setConsent(v);
    } catch {
      /* localStorage engelli olabilir — sessiz, banner yine gösterilir */
    }
  }, []);

  function choose(value: "accepted" | "declined") {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* yazılamazsa da bu oturumda tercihi uygula */
    }
    setConsent(value);
  }

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const isProd = process.env.NEXT_PUBLIC_APP_ENV === "production";
  const gaEnabled = mounted && consent === "accepted" && isProd && !!gaId;

  // Banner: mount sonrası + henüz seçim yapılmadıysa.
  const showBanner = mounted && consent === null;

  return (
    <>
      {gaEnabled && <GoogleAnalytics gaId={gaId as string} />}
      {showBanner && (
        <div className="staylo-cc" role="dialog" aria-live="polite" aria-label="Cookie consent">
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <p className="staylo-cc-text">
            We use analytics cookies to understand how visitors use Staylo. See our{" "}
            <a href="/privacy">Privacy Policy</a>. You can accept or decline.
          </p>
          <div className="staylo-cc-actions">
            <button type="button" className="staylo-cc-btn ghost" onClick={() => choose("declined")}>
              Decline
            </button>
            <button type="button" className="staylo-cc-btn accept" onClick={() => choose("accepted")}>
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}
