import { useState } from 'react';
import { useApp } from '../state/appContext';
import { Btn, Input, Kicker } from '../components/ui';
import { Icon } from '../components/Icons';

/** Palette-only nighttime skyline used as the subtle backdrop layer (no external assets, no new colors). */
function CityScape() {
  const FAR: [number, number, number][] = [[0,340,90],[80,320,70],[150,350,110],[260,310,80],[340,330,120],[460,300,90],[550,340,100],[650,320,90],[740,350,120],[860,310,80],[940,330,110],[1050,300,90],[1140,340,100],[1240,320,110],[1350,350,90]];
  const MID: [number, number, number, number][] = [[30,360,70,110],[110,330,60,140],[180,370,90,100],[280,320,70,150],[360,350,80,120],[450,310,70,160],[530,360,90,110],[630,330,70,140],[710,370,100,100],[820,320,70,150],[900,350,80,120],[990,310,70,160],[1070,360,90,110],[1170,330,80,140],[1260,360,80,110],[1350,330,70,140]];
  const NEAR: [number, number, number, number][] = [[0,400,110,120],[110,370,80,150],[190,410,120,110],[310,350,90,170],[400,390,100,130],[500,340,80,180],[580,400,110,120],[690,360,90,160],[780,410,120,110],[900,350,80,170],[980,390,100,130],[1080,340,90,180],[1170,400,110,120],[1280,360,90,160],[1370,400,70,120]];
  const WINDOWS: [number, number, number][] = [[320,362,0.55],[338,376,0.3],[356,368,0.75],[510,352,0.4],[528,366,0.65],[545,360,0.25],[700,372,0.7],[718,388,0.35],[910,362,0.5],[926,378,0.6],[944,370,0.28],[1090,352,0.72],[1108,368,0.4],[1290,372,0.55],[1306,388,0.3],[355,398,0.45],[528,398,0.5],[1108,398,0.45]];
  return (
    <svg viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-[62vh] w-full" aria-hidden="true">
      <defs>
        <linearGradient id="skyGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B5560" stopOpacity="0" />
          <stop offset="72%" stopColor="#6B5560" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#9E8189" stopOpacity="0.3" />
        </linearGradient>
        <radialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#C7A9A3" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#C7A9A3" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="150" width="1440" height="370" fill="url(#skyGlow)" />
      <circle cx="1150" cy="105" r="95" fill="url(#moonGlow)" />
      <circle cx="1150" cy="105" r="26" fill="#E8D2C4" opacity="0.45" />
      <g fill="#6B5560" opacity="0.25">
        {FAR.map(([x, y, w], i) => <rect key={i} x={x} y={y} width={w} height={420 - y} />)}
      </g>
      <g fill="#6B5560" opacity="0.42">
        {MID.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} />)}
      </g>
      <g fill="#3E3239" opacity="0.96">
        {NEAR.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} />)}
      </g>
      <g fill="#E8D2C4">
        {WINDOWS.map(([x, y, o], i) => <rect key={i} x={x} y={y} width={4} height={6} opacity={o} />)}
      </g>
      <g stroke="#C7A9A3" strokeOpacity="0.35" strokeWidth="1.5">
        <line x1="355" y1="350" x2="355" y2="310" />
        <line x1="1125" y1="340" x2="1125" y2="296" />
      </g>
      <circle cx="355" cy="308" r="2" fill="#E8D2C4" opacity="0.7" />
      <circle cx="1125" cy="294" r="2" fill="#E8D2C4" opacity="0.7" />
      <line x1="0" y1="519.5" x2="1440" y2="519.5" stroke="#C7A9A3" strokeOpacity="0.22" />
    </svg>
  );
}

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
      {/* nighttime city backdrop */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-80">
        <CityScape />
      </div>
      <div className="grain pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-6 pb-8 pt-8 sm:px-10 sm:pt-10 lg:px-16 lg:pb-12 lg:pt-12">
        {/* Branding — upper left with generous margins */}
        <div className="fade-up flex items-center gap-3.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream font-display text-xl text-ink">C</span>
          <div>
            <div className="font-display text-[16px] uppercase tracking-[0.24em] text-cream">City Traffic</div>
            <Kicker className="mt-1">Operations Intelligence Console</Kicker>
          </div>
        </div>

        {/* Hero stack — editorial heading sits directly on top of the centered access card */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 pt-10 sm:gap-7 sm:pt-12 lg:gap-8 lg:pt-0">
          {/* Editorial heading — above the card, centered */}
          <h2 className="fade-up text-center font-display text-[44px] leading-[1.02] text-cream sm:text-[56px] xl:text-[64px]" style={{ animationDelay: '90ms' }}>
            The city,
            <br />
            <span className="italic text-sand">in motion.</span>
          </h2>

          {/* Access panel — main centered focal point of the page */}
          <div className="flex w-full justify-center">
            <div
              className="fade-up w-full max-w-[540px] rounded-3xl border border-cream/10 bg-cream/[0.05] p-7 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-9 lg:w-[540px]"
              style={{ animationDelay: '140ms' }}
            >
            <Kicker>Secure access</Kicker>
            <h3 className="mt-2 font-display text-[34px] text-cream">Sign in</h3>

            <form onSubmit={submit} className="mt-5 flex flex-col gap-3.5">
              <label className="block">
                <Kicker className="mb-1.5">Operator ID</Kicker>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@cityops.gov" autoComplete="username" />
              </label>
              <label className="block">
                <Kicker className="mb-1.5">Password</Kicker>
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

              <Btn type="submit" variant="solid" disabled={busy} className="mt-1 h-10 w-auto self-start px-6 text-[14px]">
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