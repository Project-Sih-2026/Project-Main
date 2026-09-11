/**
 * Full-bleed page backdrop — the Connaught Place photograph (public/del.jpg,
 * stored sideways, pre-rotated to landscape as public/del-landscape.jpg).
 * Rendered at full strength behind every screen — no tint, no wash.
 *
 * Variants:
 *  - "login": identical photo treatment (kept for the login screen's edge
 *    scrim so the cream display type stays legible over the bright sky).
 *  - "faded": the photograph as-is at full strength on all app pages.
 */
const BG_URL = '/del-landscape.jpg';

export function PageBackground({ variant = 'faded' }: { variant?: 'login' | 'faded' }) {
  if (variant === 'login') {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${BG_URL}')` }}
        />
        {/* edge scrim only — the photograph itself stays at original strength */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(11,37,69,0.38) 0%, rgba(11,37,69,0.06) 42%, rgba(11,37,69,0.12) 70%, rgba(11,37,69,0.52) 100%)',
          }}
        />
      </div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${BG_URL}')` }}
      />
      {/* plum tint wash — darkens the photo so cream panels and UI features pop */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(11,37,69,0.78) 0%, rgba(11,37,69,0.55) 26%, rgba(11,37,69,0.5) 55%, rgba(7,24,47,0.72) 100%)',
        }}
      />
      {/* soft vignette to focus the centre of the page */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 40%, rgba(11,37,69,0) 55%, rgba(7,24,47,0.35) 100%)',
        }}
      />
    </div>
  );
}
