import { useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { Icon, type IconName } from './Icons';

export const cx = (...c: (string | false | undefined | null)[]) => twMerge(c.filter(Boolean).join(' '));

export function useClock(ms = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

type BtnVariant = 'solid' | 'soft' | 'ghost' | 'outline' | 'danger';
const V_CLASS: Record<BtnVariant, string> = {
  solid: 'bg-cream text-ink hover:bg-sand shadow-[0_2px_14px_rgba(217,228,242,0.18)]',
  soft: 'bg-cream/80 text-ink border border-clay/35 hover:bg-sand/80 hover:border-mauve/35',
  ghost: 'text-mauve hover:text-ink hover:bg-sand/45',
  outline: 'border border-clay/60 text-mauve hover:text-ink hover:border-mauve bg-transparent',
  danger: 'bg-mauve/18 text-ink border border-mauve/40 hover:bg-mauve/24',
};

export function Btn({
  variant = 'soft',
  size = 'md',
  icon,
  className,
  children,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: 'sm' | 'md' | 'icon'; icon?: IconName }) {
  return (
    <button
      {...p}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap',
        size === 'sm' ? 'h-9 px-3.5 text-[14px]' : size === 'icon' ? 'h-9 w-9' : 'h-10 px-5 text-[14px]',
        V_CLASS[variant],
        className
      )}
    >
      {icon && <Icon name={icon} className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
      {children}
    </button>
  );
}

export function Card({ className, children, onClick, hover, tone = 'line' }: { className?: string; children: ReactNode; onClick?: () => void; hover?: boolean; tone?: 'line' | 'strong' | 'quiet' }) {
  return (
    <div
      onClick={onClick}
      className={cx(
        'rounded-2xl transition-colors duration-200',
        tone === 'strong' && 'border border-clay/40 bg-cream/90 shadow-[0_18px_50px_-30px_rgba(11,37,69,0.25)]',
        tone === 'line' && 'border border-clay/30 bg-cream/75',
        tone === 'quiet' && 'border border-transparent bg-sand/35',
        hover && onClick && 'cursor-pointer hover:border-mauve/35 hover:bg-cream',
        className
      )}
    >
      {children}
    </div>
  );
}

export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('text-[14px] font-bold uppercase tracking-[0.14em] text-mauve/80', className)}>{children}</div>;
}

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: 'critical' | 'high' | 'medium' | 'low' | 'neutral' | 'good';
  className?: string;
  children: ReactNode;
}) {
  const t = {
    critical: 'bg-sand text-ink',
    high: 'bg-clay text-ink',
    medium: 'bg-dusk text-ink',
    low: 'bg-mauve text-cream',
    neutral: 'bg-sand/60 text-mauve',
    good: 'bg-cream text-mauve border border-clay/35',
  }[tone];
  return <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[14px] font-bold uppercase tracking-[0.08em]', t, className)}>{children}</span>;
}

export const sevTone = (s: string): 'critical' | 'high' | 'medium' | 'low' =>
  s === 'critical' ? 'critical' : s === 'high' ? 'high' : s === 'medium' ? 'medium' : 'low';

export const statusTone = (s: string): 'critical' | 'medium' | 'good' =>
  s === 'open' ? 'critical' : s === 'acknowledged' ? 'medium' : 'good';

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: { id: string; label: string; count?: number }[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cx('inline-flex items-center gap-1 rounded-xl border border-clay/35 bg-sand/55 p-1', className)}>
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onChange(it.id)}
          className={cx(
            'inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition-all duration-150 active:scale-[0.97]',
            value === it.id ? 'bg-cream text-ink shadow-sm' : 'text-mauve/75 hover:bg-cream/70 hover:text-ink'
          )}
        >
          {it.label}
          {it.count !== undefined && (
            <span className={cx('text-[14px] font-semibold tabular-nums', value === it.id ? 'text-ink/60' : 'text-mauve/60')}>{it.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label?: string; hint?: string }) {
  return (
    <button onClick={() => onChange(!on)} className="group flex w-full items-center justify-between gap-4 py-2 text-left">
      <span>
        {label && <span className="block text-[14px] font-semibold text-ink/90">{label}</span>}
        {hint && <span className="mt-0.5 block text-[14px] font-semibold text-mauve/70">{hint}</span>}
      </span>
      <span className={cx('relative h-6 w-10 shrink-0 rounded-full border transition-colors duration-200', on ? 'border-sand/70 bg-sand/80' : 'border-clay/35 bg-cream/80 group-hover:border-mauve/35')}>
        <span className={cx('absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all duration-200', on ? 'left-[22px] bg-ink' : 'left-[3px] bg-clay/80')} />
      </span>
    </button>
  );
}
export function Select({
  value,
  onChange,
  options,
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div className={cx('relative', className)}>
      <select aria-label={ariaLabel} value={value} onChange={(e) => onChange(e.target.value)} className="input-base h-9 cursor-pointer appearance-none pr-9 text-[13px]">
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Icon name="chevronDown" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mauve/70" />
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx('input-base', props.className)} />;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <Kicker className="mb-1.5">{label}</Kicker>
      {children}
    </label>
  );
}

export function Empty({ icon = 'search', title, sub }: { icon?: IconName; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-clay/30 bg-cream/80 text-mauve/70">
        <Icon name={icon} />
      </div>
      <div className="text-[16px] font-bold text-ink/90">{title}</div>
      {sub && <div className="max-w-[280px] text-[14px] font-semibold leading-relaxed text-mauve/80">{sub}</div>}
    </div>
  );
}

export function Bars({ data, onClick }: { data: { label: string; value: number; hint?: string }[]; onClick?: (label: string) => void }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex flex-col gap-2.5">
      {data.map((d) => (
        <button
          key={d.label}
          onClick={() => onClick?.(d.label)}
          className="group grid grid-cols-[110px_1fr_52px] items-center gap-3 text-left"
        >
          <span className="truncate text-[14px] font-bold text-mauve/85 transition-colors group-hover:text-ink">{d.label}</span>
          <span className="h-2 overflow-hidden rounded-full bg-clay/18">
            <span className="block h-full rounded-full bg-clay/70 transition-all duration-500 group-hover:bg-sand" style={{ width: `${(d.value / max) * 100}%` }} />
          </span>
          <span className="text-right text-[14px] font-semibold tabular-nums text-mauve/80">{d.hint ?? d.value}</span>
        </button>
      ))}
    </div>
  );
}

export function Toasts({ items = [] }: { items?: { id: number; msg: string }[] }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[80] flex flex-col gap-2">
      {items.map((t) => (
        <div key={t.id} className="toast-in rounded-xl border border-sand/25 bg-sand px-4 py-3 text-[14px] font-bold text-ink shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
          {t.msg}
        </div>
      ))}
    </div>
  );
}