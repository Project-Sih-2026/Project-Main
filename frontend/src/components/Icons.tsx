import type { ReactNode } from 'react';

const P: Record<string, ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7.5" height="9" rx="1.8" /><rect x="13.5" y="3" width="7.5" height="5.5" rx="1.8" /><rect x="13.5" y="12.5" width="7.5" height="8.5" rx="1.8" /><rect x="3" y="16" width="7.5" height="5" rx="1.8" /></>,
  car: <><path d="M5 16.5 6.3 11a2 2 0 0 1 1.94-1.5h7.52A2 2 0 0 1 17.7 11l1.3 5.5" /><path d="M4 16.5h16a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1h-1.2a1.8 1.8 0 1 1-3.6 0H8.8a1.8 1.8 0 1 1-3.6 0H4a1 1 0 0 1-1-1v-1.5a1 1 0 0 1 1-1Z" /><path d="M7.5 13.5h.01M16.5 13.5h.01" /></>,
  camera: <><path d="M2.5 7.5A1.5 1.5 0 0 1 4 6h3l1.6-2h6.8L17 6h3a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 20 19H4a1.5 1.5 0 0 1-1.5-1.5Z" /><circle cx="12" cy="12.5" r="3.4" /></>,
  map: <><path d="m9 3 6 2.5L21 3v15l-6 2.5L9 18l-6 2.5v-15Z" /><path d="M9 3v15M15 5.5v15" /></>,
  bell: <><path d="M6 9.5a6 6 0 0 1 12 0c0 4.3 1.5 5.6 1.5 5.6h-15S6 13.8 6 9.5Z" /><path d="M10 19a2.2 2.2 0 0 0 4 0" /></>,
  chart: <><path d="M3.5 20.5h17" /><path d="M6.5 16.5v-5M11 16.5v-9M15.5 16.5v-7M19.5 16.5v-12" /></>,
  settings: <><circle cx="12" cy="12" r="3.2" /><path d="M12 2.8v2.4M12 18.8v2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7" /></>,
  logout: <><path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9" /><path d="m15 8 4 4-4 4M19 12H9" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.4-4.4" /></>,
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  chevronRight: <path d="m9.5 6 6 6-6 6" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  download: <><path d="M12 4v10.5M8 11l4 4 4-4" /><path d="M4.5 19.5h15" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5.2l3.4 2" /></>,
  refresh: <><path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20 3.5V7h-3.5" /></>,
  play: <path d="M8 5.5v13l10-6.5Z" />,
  pause: <path d="M8.5 5.5v13M15.5 5.5v13" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  locate: <><circle cx="12" cy="12" r="6.5" /><circle cx="12" cy="12" r="1.4" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" /></>,
  arrowUpRight: <path d="M7 17 17 7M9 7h8v8" />,
  arrowUp: <path d="M12 19V5M6 11l6-6 6 6" />,
  arrowDown: <path d="M12 5v14M6 13l6 6 6-6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  pin: <><path d="M12 21s-6.5-5.4-6.5-10.2a6.5 6.5 0 0 1 13 0C18.5 15.6 12 21 12 21Z" /><circle cx="12" cy="10.5" r="2.3" /></>,
  shield: <path d="M12 3 5 5.8v5.4c0 4.6 3 7.8 7 9.8 4-2 7-5.2 7-9.8V5.8Z" />,
  activity: <path d="M3 12h4l2.5-6 4 12L16 12h5" />,
  layers: <><path d="m12 3 9 5-9 5-9-5Z" /><path d="m4.5 12.8 7.5 4.2 7.5-4.2" /><path d="m4.5 16.8 7.5 4.2 7.5-4.2" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></>,
  trash: <><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></>,
  edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
  info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>,
  compass: <><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></>,
};

export type IconName = keyof typeof P;

export function Icon({
  name,
  className = 'h-[18px] w-[18px]',
  strokeWidth = 1.6,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {P[name]}
    </svg>
  );
}