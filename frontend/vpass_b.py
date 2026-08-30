import re, pathlib
FE = pathlib.Path('/Users/apple/Desktop/hackathon/Project-Main/frontend')
ok, warn = [], []
def load(p): return (FE/p).read_text()
def save(p, s): (FE/p).write_text(s)

ui = load('src/components/ui.tsx')
if "tone?: 'line' | 'strong' | 'quiet'" not in ui:
    print('ABORT: Card tone system missing — run script A first'); raise SystemExit(1)

# 1) one hero card per page gets strong emphasis; KPI cards go quiet
PAGES = ['DashboardPage','VehicleSearchPage','AlertCenterPage','CameraOpsPage','AnalyticsViewPage','SettingsPage','CityMapPage']
for p in PAGES:
    f = f'src/pages/{p}.tsx'; s = load(f)
    s2, n = re.subn(r'<Card className=', lambda m: '<Card tone="strong" className=', s, count=1)
    save(f, s2); (ok if n else warn).append(f'hero {p}: x{n}')

d = 'src/pages/DashboardPage.tsx'; s = load(d)
s2, n = re.subn(r'<Card className="p-4">', lambda m: '<Card tone="quiet" className="p-4">', s)
save(d, s2); (ok if n else warn).append(f'KPI quiet cards: x{n}')
s2, n = re.subn(r'text-\[27px\] leading-none text-cream', lambda m: 'text-[34px] leading-none text-sand', s2, count=4)
save(d, s2); (ok if n else warn).append(f'KPI stat scale: x{n}')

# 2) login primary action sized, not stretched
f = 'src/pages/LoginPage.tsx'; s = load(f); done = False
for i, l in enumerate(s.split('\n')):
    if 'w-full' in l and ('<Btn' in l or '<button' in l):
        s = s.replace(l, l.replace('w-full', 'min-w-[240px]', 1), 1); done = True; break
if done: save(f, s)
(ok if done else warn).append(f'login button width: {done}')

# 3) secondary zones quieter on flagship page (dashboard aside cards)
d = 'src/pages/DashboardPage.tsx'; s = load(d)
s2, n = re.subn(r'<Card className="p-4 sm:p-5">', lambda m: '<Card tone="quiet" className="p-4 sm:p-5">', s)
if n: save(d, s2)
(ok if n else warn).append(f'dashboard secondary quiet: x{n}')
s = load(d); s2, n = re.subn(r'<Card tone="quiet" className="p-4 sm:p-5">', lambda m: '<Card tone="strong" className="p-4 sm:p-5">', s, count=1)
if n: save(d, s2)
(ok if n else warn).append(f'dashboard hero restored: x{n}')

print('== SCRIPT B RESULT =='); [print('OK  ', x) for x in ok]
print('WARN:' if warn else 'WARN: none'); [print('WARN', x) for x in warn]
