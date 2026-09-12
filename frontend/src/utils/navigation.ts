/**
 * Dynamic URL helpers for multi-device cross-portal navigation.
 * Eliminates hardcoded 'localhost' so the app works seamlessly across
 * local machines, mobile devices, LAN Wi-Fi networks, and remote hosts.
 */

export function getDetectionPortalUrl(standalone: boolean = false): string {
  if (standalone) {
    return '/detection.html';
  }
  return '/#upload';
}

export function getOperationsPortalUrl(hashOrPage: string = '', vehiclePlate?: string): string {
  let cleanHash = hashOrPage ? (hashOrPage.startsWith('#') ? hashOrPage.slice(1) : hashOrPage) : '';
  if (vehiclePlate) {
    const sep = cleanHash.includes('?') ? '&' : '?';
    cleanHash = `${cleanHash}${sep}vehicle=${encodeURIComponent(vehiclePlate)}`;
  }
  const fullHash = cleanHash ? `#${cleanHash}` : '';
  return `/${fullHash}`;
}
