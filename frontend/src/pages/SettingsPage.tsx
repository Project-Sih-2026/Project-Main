import { useState } from 'react';
import { useApp } from '../state/appContext';
import { Icon } from '../components/Icons';
import { Badge, Btn, Card, Field, Input, Kicker, Select, Tabs, Toggle, cx } from '../components/ui';

const TABS = ['Profile', 'Display', 'Notifications', 'Map layers', 'Data'];

export function SettingsPage() {
  const app = useApp();
  const [tab, setTab] = useState('Profile');
  const [name, setName] = useState(app.user?.name ?? '');
  const [email, setEmail] = useState(app.user?.email ?? '');
  const s = app.settings;

  return (
    <div className="page-shell fade-up">
      <div className="page-hero px-5 py-5 sm:px-6 sm:py-6">
        <Kicker className="text-sand">Console</Kicker>
        <p className="mt-1 font-display text-[34px] font-bold leading-tight text-cream">Settings</p>
      </div>

      <Tabs items={TABS.map((t) => ({ id: t, label: t }))} value={tab} onChange={setTab} />
      {tab === 'Profile' && (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Card tone="strong" className="section-contrast p-4 sm:p-5">
            <Kicker>Operator profile</Kicker>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="Work email"><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></Field>
              <Field label="Role">
                <Select value={app.user?.role ?? 'Operator'} onChange={(v) => app.updateUser({ role: v })} options={['Operator', 'Analyst', 'Administrator']} />
              </Field>
            </div>
            <div className="mt-5 flex gap-2">
              <Btn variant="solid" icon="check" onClick={() => { app.updateUser({ name: name.trim() || 'Operator', email }); app.toast('Profile saved'); }}>Save changes</Btn>
              <Btn variant="ghost" onClick={() => { setName(app.user?.name ?? ''); setEmail(app.user?.email ?? ''); app.toast('Reverted'); }}>Revert</Btn>
            </div>
          </Card>
          <Card className="page-hero h-fit p-4 sm:p-5">
            <Kicker className="text-sand">Session</Kicker>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sand font-display text-[16px] text-ink">{(app.user?.name ?? 'O').split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
              <div>
                <div className="text-[14px] font-bold text-cream">{app.user?.name}</div>
                <div className="text-[14px] font-semibold text-sand/85">{app.user?.email}</div>
              </div>
            </div>
            <div className="mt-4 border-t border-cream/15 pt-4">
              <Btn variant="danger" size="sm" icon="logout" onClick={app.logout}>Sign out of console</Btn>
            </div>
          </Card>
        </div>
      )}
      {tab === 'Display' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="section-contrast p-4 sm:p-5">
            <Kicker>Units & layout</Kicker>
            <div className="mt-3">
              <Field label="Speed units">
                <div className="mt-1 inline-flex overflow-hidden rounded-xl border border-clay/30 bg-cream/80">
                  {(['km/h', 'mph'] as const).map((u) => (
                    <button key={u} onClick={() => { app.update({ units: u }); app.toast(`Speeds shown in ${u}`); }} className={cx('px-4 py-2 text-[14px] font-bold transition-colors', s.units === u ? 'bg-mauve text-cream' : 'text-mauve hover:bg-sand/45 hover:text-ink')}>{u}</button>
                  ))}
                </div>
              </Field>
              <div className="mt-2 divide-y divide-clay/25">
                <Toggle on={s.compact} onChange={(v) => { app.update({ compact: v }); app.toast(v ? 'Compact density on' : 'Comfortable density on'); }} label="Compact density" hint="Tighter paddings across the console" />
                <Toggle on={s.reduceMotion} onChange={(v) => { app.update({ reduceMotion: v }); app.toast(v ? 'Motion reduced' : 'Motion restored'); }} label="Reduce motion" hint="Disables scan, pulse and flow animations" />
              </div>
            </div>
          </Card>
          <Card className="page-hero p-4 sm:p-5">
            <Kicker>Preview</Kicker>
            <div className="mt-3 rounded-xl border border-clay/25 bg-cream/80 p-4">
              <div className="text-[14px] font-bold text-sand/85">Corridor speed sample</div>
              <div className="mt-1 font-display text-[30px] font-bold text-cream">{app.fmtSpeed(62)}</div>
              <div className="mt-3 flex gap-2">
                <Badge tone="good">online</Badge>
                <Badge tone="medium">degraded</Badge>
                <Badge tone="critical">offline</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}
      {tab === 'Notifications' && (
        <Card className="section-contrast max-w-xl p-4 sm:p-5">
          <Kicker>Alert delivery</Kicker>
          <div className="mt-2 divide-y divide-clay/25">
            <Toggle on={s.notif.critical} onChange={(v) => { app.update({ notif: { ...s.notif, critical: v } }); app.toast(`Critical alerts ${v ? 'enabled' : 'muted'}`); }} label="Critical alerts" hint="Immediate push for wrong-way, collision and stolen events" />
            <Toggle on={s.notif.watchlist} onChange={(v) => { app.update({ notif: { ...s.notif, watchlist: v } }); app.toast(`Watchlist matches ${v ? 'enabled' : 'muted'}`); }} label="Watchlist matches" hint="Notify on every confirmed plate hit" />
            <Toggle on={s.notif.offline} onChange={(v) => { app.update({ notif: { ...s.notif, offline: v } }); app.toast(`Camera offline alerts ${v ? 'enabled' : 'muted'}`); }} label="Camera offline" hint="Feed loss longer than 30 seconds" />
            <Toggle on={s.notif.digest} onChange={(v) => { app.update({ notif: { ...s.notif, digest: v } }); app.toast(`Daily digest ${v ? 'enabled' : 'disabled'}`); }} label="Daily digest" hint="07:00 summary of network performance" />
          </div>
        </Card>
      )}

      {tab === 'Map layers' && (
        <Card className="max-w-xl p-4 sm:p-5">
          <Kicker>Default visibility</Kicker>
          <div className="mt-2 divide-y divide-clay/25">
            {(['cameras', 'vehicles', 'alerts', 'congestion', 'watchlist'] as const).map((k) => (
              <Toggle
                key={k}
                on={s.mapLayers[k]}
                onChange={(v) => { app.update({ mapLayers: { ...s.mapLayers, [k]: v } }); app.toast(`${k[0].toUpperCase() + k.slice(1)} layer default ${v ? 'on' : 'off'}`); }}
                label={k[0].toUpperCase() + k.slice(1)}
                hint={k === 'watchlist' ? 'Ring highlight around watchlisted vehicles' : 'Shown when the City Map page loads'}
              />
            ))}
          </div>
          <Btn size="sm" variant="ghost" className="mt-3" icon="map" onClick={() => app.nav({ page: 'map' })}>Open City Map <Icon name="arrowRight" className="h-3.5 w-3.5" /></Btn>
        </Card>
      )}

      {tab === 'Data' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="section-contrast p-4 sm:p-5">
            <Kicker>Session snapshot</Kicker>
            <p className="mt-2 text-[14px] font-semibold leading-relaxed text-mauve/75">
              All figures in this console are generated in the frontend for demonstration. Restore the snapshot to undo watchlist edits, alert triage and preference changes.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Btn icon="refresh" onClick={() => app.resetData()}>Restore demo data</Btn>
              <Btn variant="soft" icon="download" onClick={() => app.toast('Snapshot exported — check your downloads')}>Export JSON</Btn>
            </div>
          </Card>
          <Card className="section-contrast p-4 sm:p-5">
            <Kicker>Data residency</Kicker>
            <div className="mt-3 flex flex-col gap-2 text-[14px] font-semibold text-mauve/75">
              <div className="flex items-center justify-between rounded-xl border border-clay/25 bg-cream/80 px-3.5 py-2.5"><span>ANPR retention</span><span className="font-semibold text-ink/85">72 hours</span></div>
              <div className="flex items-center justify-between rounded-xl border border-clay/25 bg-cream/80 px-3.5 py-2.5"><span>Journey history</span><span className="font-semibold text-ink/85">30 days</span></div>
              <div className="flex items-center justify-between rounded-xl border border-clay/25 bg-cream/80 px-3.5 py-2.5"><span>Audit log</span><span className="font-semibold text-ink/85">5 years</span></div>
            </div>
          </Card>
        </div>
      )}

      <div className="flex justify-end border-t border-clay/25 pt-2">
        <Btn variant="ghost" size="sm" icon="logout" onClick={app.logout}>Sign out of this console</Btn>
      </div>
    </div>
  );
}