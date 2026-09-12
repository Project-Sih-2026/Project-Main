import { useState } from 'react';
import { useApp } from '../state/appContext';
import { Btn, Input, Kicker } from '../components/ui';
import { Icon } from '../components/Icons';
import { PageBackground } from '../components/layout/PageBackground';

export function LoginPage() {
  const app = useApp();
  const [email, setEmail] = useState('ava.chen@cityops.gov');
  const [pass, setPass] = useState('citypulse');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!email.includes('@')) return setErr('Enter a valid work email.');
    if (pass.length < 4) return setErr('Password must be at least 4 characters.');
    setBusy(true);
    setTimeout(() => {
      const ok = app.login(email, pass);
      setBusy(false);
      if (!ok) setErr('Any password of 4+ characters works in this demo.');
    }, 550);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      {/* ambient light */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[540px] w-[540px] rounded-full bg-clay/15 blur-[140px]" />
      <div className="pointer-events-none absolute -right-32 top-[10%] h-[460px] w-[460px] rounded-full bg-mauve/25 blur-[130px]" />
      {/* Connaught Place photograph — original strength on the login screen */}
      <PageBackground variant="login" />
      <div className="grain pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-6 pb-8 pt-8 sm:px-10 sm:pt-10 lg:px-16 lg:pb-12 lg:pt-12">
        {/* Branding — upper left with generous margins */}
        <div className="fade-up flex items-center gap-3.5">
          <img
            src="/netra-logo.png"
            alt="NETRA"
            className="h-12 w-auto object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-transform hover:scale-105"
          />
          <div className="border-l border-white/40 pl-3.5">
            <div className="font-display text-[17px] uppercase tracking-[0.24em] text-white font-bold drop-shadow">NETRA</div>
            <div className="mt-0.5 text-[14px] font-bold uppercase tracking-[0.14em] text-white drop-shadow">Operations Intelligence Console</div>
          </div>
        </div>

        {/* Hero stack — editorial heading sits directly on top of the centered access card */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 pt-10 sm:gap-7 sm:pt-12 lg:gap-8 lg:pt-0">
          {/* Editorial heading — above the card, centered */}
          <h2 className="fade-up text-center font-display text-[44px] leading-[1.02] text-white sm:text-[56px] xl:text-[64px]" style={{ animationDelay: '90ms' }}>
            The city,
            <br />
            <span className="italic text-sand">in motion.</span>
          </h2>

          {/* Access panel — main centered focal point of the page */}
          <div className="flex w-full justify-center">
            <div
              className="fade-up w-full max-w-[540px] rounded-3xl border border-white/20 bg-black/40 p-7 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-9 lg:w-[540px]"
              style={{ animationDelay: '140ms' }}
            >
            <Kicker className="text-white/80">Secure access</Kicker>
            <h3 className="mt-2 font-display text-[34px] text-white font-bold">Sign in</h3>

            <form onSubmit={submit} className="mt-5 flex flex-col gap-3.5">
              <label className="block">
                <Kicker className="mb-1.5 text-white/90">Operator ID</Kicker>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@cityops.gov" autoComplete="username" />
              </label>
              <label className="block">
                <Kicker className="mb-1.5 text-white/90">Password</Kicker>
                <div className="relative">
                  <Input type={show ? 'text' : 'password'} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" autoComplete="current-password" className="pr-11" />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-clay/60 transition hover:text-cream"
                  >
                    <Icon name="eye" className="h-4 w-4" />
                  </button>
                </div>
              </label>

              {err && <div className="rounded-xl border border-sand/30 bg-sand/10 px-3 py-2.5 text-[14px] font-semibold text-sand">{err}</div>}

              <Btn type="submit" variant="solid" disabled={busy} className="mt-1 h-10 w-auto self-start px-6 text-[14px] bg-white text-slate-950 hover:bg-slate-200 font-bold">
                {busy ? 'Verifying…' : 'Sign in'}
                <Icon name="arrowRight" className="h-4 w-4" />
              </Btn>
            </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}