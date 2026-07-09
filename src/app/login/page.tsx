"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
  :root{--ink:#03045e;--body:#33506a;--muted:#6f8a9c;--faint:#9fb4c2;--border:#e4edf3;
        --surface-2:#f3f9fc;--ocean:#0077b6;--sky:#90e0ef;--cyan:#00b4d8;}
  *{box-sizing:border-box;}
  .lg-page{min-height:100vh;font-family:'Geist',system-ui,sans-serif;color:var(--body);
    background:linear-gradient(180deg,#cfe9f6 0%,#dcf1fb 40%,#eef9fd 72%,#fff 100%);
    display:flex;flex-direction:column;align-items:center;padding:0 24px;}
  .lg-nav{width:100%;max-width:1160px;display:flex;align-items:center;justify-content:space-between;padding:20px 4px;}
  .logo{display:inline-flex;align-items:center;}
  .logo .w{font-weight:700;letter-spacing:-0.05em;color:var(--ink);font-size:26px;}
  .logo .sq{display:flex;align-items:center;justify-content:center;transform:rotate(-4deg);position:relative;
    overflow:hidden;border-radius:3px;margin-left:0.07em;width:28px;height:28px;}
  .logo .sq .h{position:absolute;top:0;height:100%;width:50%;}
  .logo .sq .h.l{left:0;background:var(--sky);} .logo .sq .h.r{right:0;background:var(--ink);}
  .logo .o{position:absolute;z-index:2;font-weight:700;letter-spacing:-0.05em;line-height:1;
    left:50%;top:50%;transform:translate(-50%,-53%);font-size:22px;color:#fff;}
  .logo .o.oL{clip-path:inset(0 50% 0 0);} .logo .o.oR{clip-path:inset(0 0 0 50%);}
  .lg-nav a.back{font-size:14px;font-weight:600;color:var(--ink);}
  .lg-card{background:#fff;border:1px solid var(--border);border-radius:20px;
    box-shadow:0 40px 90px -54px rgba(3,4,94,0.45);padding:40px 38px;width:100%;max-width:440px;margin:6vh 0 40px;}
  .lg-card h1{font-size:28px;font-weight:700;letter-spacing:-0.03em;color:var(--ink);margin:0 0 8px;}
  .lg-card .sub{font-size:14.5px;color:var(--muted);margin:0 0 26px;line-height:1.5;}
  .gbtn{display:flex;align-items:center;justify-content:center;gap:11px;width:100%;padding:13px;
    border:1px solid var(--border);border-radius:12px;background:#fff;color:var(--ink);
    font:600 15px 'Geist',sans-serif;cursor:pointer;transition:background 120ms,border-color 120ms;}
  .gbtn:hover{background:var(--surface-2);border-color:#cddde8;}
  .gbtn svg{width:18px;height:18px;}
  .divider{display:flex;align-items:center;gap:14px;margin:22px 0;color:var(--faint);font-size:12.5px;}
  .divider::before,.divider::after{content:"";flex:1;height:1px;background:var(--border);}
  label{display:block;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:var(--muted);
    font-weight:700;margin-bottom:8px;}
  input[type=email]{width:100%;border:1px solid var(--border);border-radius:12px;padding:13px 15px;
    font:500 15px 'Geist',sans-serif;color:var(--ink);outline:none;transition:border-color 120ms;}
  input[type=email]:focus{border-color:var(--ocean);}
  .submit{margin-top:14px;width:100%;padding:13px;border:1px solid var(--ink);border-radius:12px;
    background:var(--ink);color:#fff;font:600 15px 'Geist',sans-serif;cursor:pointer;transition:background 120ms;}
  .submit:hover{background:#06075f;} .submit:disabled{opacity:0.6;cursor:default;}
  .msg{margin-top:16px;font-size:13.5px;line-height:1.5;padding:12px 14px;border-radius:10px;}
  .msg.ok{background:#e9f7f0;color:#1c7a4d;border:1px solid #bce6d1;}
  .msg.err{background:#fdecea;color:#c0392b;border:1px solid #f5c6c0;}
  .foot{margin-top:22px;font-size:12px;color:var(--faint);line-height:1.5;text-align:center;}`;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [next, setNext] = useState("/saved");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const n = params.get("next");
    if (n && n.startsWith("/") && !n.startsWith("//")) setNext(n);
    if (params.get("error") === "auth") {
      setMsg({ type: "err", text: "That sign-in link was invalid or expired. Please try again." });
    }
  }, []);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setMsg(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ type: "err", text: data.error || "Something went wrong. Please try again." });
      } else {
        setMsg({ type: "ok", text: `Check ${email} — we sent you a magic link to sign in.` });
      }
    } catch {
      setMsg({ type: "err", text: "Network error. Please try again." });
    }
    setBusy(false);
  }

  async function signInWithGoogle() {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (error) {
        setMsg({ type: "err", text: "Google sign-in is unavailable right now." });
        setBusy(false);
      }
      // başarılıysa tarayıcı Google'a yönlenir; setBusy'yi bırakmaya gerek yok
    } catch {
      setMsg({ type: "err", text: "Google sign-in is unavailable right now." });
      setBusy(false);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="lg-page">
        <div className="lg-nav">
          <a href="/" className="logo">
            <span className="w">stayl</span>
            <span className="sq"><span className="h l"></span><span className="h r"></span>
              <span className="o oL">o</span><span className="o oR">o</span></span>
          </a>
          <a href="/" className="back">← Back</a>
        </div>

        <div className="lg-card">
          <h1>Log in or sign up</h1>
          <p className="sub">Save hotels you love and come back to them anytime. No password needed.</p>

          <button className="gbtn" onClick={signInWithGoogle} disabled={busy} type="button">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.9 2.6 30.4 0 24 0 14.6 0 6.4 5.4 2.5 13.2l7.8 6.1C12.2 13.3 17.6 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-16.5z"/>
              <path fill="#FBBC05" d="M10.3 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.8l7.8-6.1z"/>
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.3-4.5 2.1-8.8 2.1-6.4 0-11.8-3.8-13.7-9.8l-7.8 6.1C6.4 42.6 14.6 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div className="divider">or</div>

          <form onSubmit={sendMagicLink}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <button className="submit" type="submit" disabled={busy || email.trim().length < 3}>
              {busy ? "Sending…" : "Send magic link"}
            </button>
          </form>

          {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

          <p className="foot">By continuing you agree to Staylo's terms. We only use your email to sign you in.</p>
        </div>
      </div>
    </>
  );
}
