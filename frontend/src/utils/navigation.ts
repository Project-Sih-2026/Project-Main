/**
 * Dynamic URL helpers for multi-device cross-portal navigation.
 * Eliminates hardcoded 'localhost' so the app works seamlessly across
 * local machines, mobile devices, LAN Wi-Fi networks, and remote hosts.
 */

export function getDetectionPortalUrl(useSamePortFallback: boolean = false): string {
  if (typeof window === 'undefined') return '/detection.html';
  if (useSamePortFallback) return '/detection.html';

  // If already on port 5174, stay on this origin
  if (window.location.port === '5174') {
    return '/';
  }

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:5174`;
}

export function getOperationsPortalUrl(hashOrPage: string = '', vehiclePlate?: string): string {
  if (typeof window === 'undefined') return '/';
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  let cleanHash = hashOrPage ? (hashOrPage.startsWith('#') ? hashOrPage.slice(1) : hashOrPage) : '';
  if (vehiclePlate) {
    const sep = cleanHash.includes('?') ? '&' : '?';
    cleanHash = `${cleanHash}${sep}vehicle=${encodeURIComponent(vehiclePlate)}`;
  }
  const fullHash = cleanHash ? `#${cleanHash}` : '';

  // If on port 5174, route to port 5173 on the same host
  if (window.location.port === '5174') {
    return `${protocol}//${hostname}:5173/${fullHash}`;
  }

  return `/${fullHash}`;
}
