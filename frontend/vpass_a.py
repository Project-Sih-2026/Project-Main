import re, pathlib
FE = pathlib.Path('/Users/apple/Desktop/hackathon/Project-Main/frontend')
ok, warn = [], []
def load(p): return (FE/p).read_text()
def save(p, s): (FE/p).write_text(s)

# 1) CSS overrides — spacing, contrast primitives, readability (append = idempotent)
css = 'src/index.css'; c = load(css)
MARK = '/* == visual-pass overrides == */'
ADD = MARK + '''
.page-shell { gap: 30px; padding: 34px 44px 72px; }
.compact .page-shell { gap: 16px; padding: 18px 24px 40px; }
.hit { gap: 12px; padding: 10px 12px; font-size: 13.5px; }
.input-base { font-size: 14px; height: 44px; }
.panel-strong { background: rgba(247,239,231,.07); border: 1px solid rgba(247,239,231,.16); border-radius: 16px; box-shadow: 0 18px 50px -30px rgba(0,0,0,.9); }
.block-quiet { background: rgba(247,239,231,.02); border: 1px solid transparent; border-radius: 16px; }
@media (max-width: 1024px){ .page-shell { padding: 24px 22px 56px; gap: 22px; } }
@media (max-width: 640px){ .page-shell { padding: 18px 16px 48px; gap: 18px; } }
'''
if MARK in c:
    ok.append('css: already patched')
else:
    save(css, c.rstrip() + '\n\n' + ADD + '\n'); ok.append('css: overrides appended')

# 2) ui.tsx — Card tone system + primary-action sizing
u = 'src/components/ui.tsx'; s = load(u)
NEW_CARD = """export function Card({ className, children, onClick, hover, tone = 'line' }: { className?: string; children: ReactNode; onClick?: () => void; hover?: boolean; tone?: 'line' | 'strong' | 'quiet' }) {
  return (
    <div
      onClick={onClick}
      className={cx(
        'rounded-2xl transition-colors duration-200',
        tone === 'strong' && 'border border-cream/[0.16] bg-cream/[0.07] shadow-[0_18px_50px_-30px_rgba(0,0,0,0.9)]',
        tone === 'line' && 'border border-cream/[0.07] bg-cream/[0.028]',
        tone === 'quiet' && 'border border-transparent bg-cream/[0.02]',
        hover && onClick && 'cursor-pointer hover:border-cream/25 hover:bg-cream/[0.07]',
        className
      )}
    >
      {children}
    </div>
  );
}
"""
s2, n = re.subn(r"export function Card\(\{.*?\n\}\n", lambda m: NEW_CARD, s, count=1, flags=re.S)
(ok if n else warn).append(f'ui: Card tone system x{n}'); s = s2
s2, n = re.subn(r"size === 'sm' \? '[^']+' : size === 'icon' \? '[^']+' : '[^']+'",
    lambda m: "size === 'sm' ? 'h-9 px-3.5 text-[13px]' : size === 'icon' ? 'h-9 w-9' : 'h-10 px-5 text-[14px]'", s, count=1)
(ok if n else warn).append(f'ui: Btn sizing x{n}'); s = s2
save(u, s)
CARD_OK = "tone?: 'line' | 'strong' | 'quiet'" in s
(ok if CARD_OK else warn).append(f'ui: tone prop available={CARD_OK}')

# 3) global single-pass readability bump (+1px on 9-13px text; no cascade)
BUMP = {'9':'10','9.5':'10.5','10':'11','10.5':'11.5','11':'12','11.5':'12.5','12':'13','12.5':'13.5','13':'14','13.5':'14.5'}
FILES = ['src/components/ui.tsx','src/components/layout/TopBar.tsx','src/pages/DashboardPage.tsx','src/pages/VehicleSearchPage.tsx','src/pages/AlertCenterPage.tsx','src/pages/CameraOpsPage.tsx','src/pages/AnalyticsViewPage.tsx','src/pages/SettingsPage.tsx','src/pages/CityMapPage.tsx','src/pages/LoginPage.tsx']
pat = re.compile(r"text-\[(9|9\.5|10|10\.5|11|11\.5|12|12\.5|13|13\.5)px\]")
for f in FILES:
    s = load(f); s2, n = pat.subn(lambda m: 'text-[' + BUMP[m.group(1)] + 'px]', s)
    save(f, s2); ok.append(f'bump {f}: x{n}')

# 4) editorial title scale
for rx, rep in [(r"(font-display text-)\[(24|26|28)px\]", '[34px]'), (r"(font-display text-)\[(18|19|20)px\]", '[22px]')]:
    tpat = re.compile(rx)
    for f in FILES:
        s = load(f); s2, n = tpat.subn(lambda m: m.group(1) + rep, s)
        if n: save(f, s2)
        ok.append(f'title {f}: x{n}')

print('== SCRIPT A RESULT =='); [print('OK  ', x) for x in ok]
print('WARN:' if warn else 'WARN: none'); [print('WARN', x) for x in warn]
if not CARD_OK: raise SystemExit(1)
