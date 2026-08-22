export function countryCodeToFlag(code: string): string {
  const c = code?.trim()?.toUpperCase() ?? '';
  if (c.length !== 2) return '';
  return [...c].map((ch) => String.fromCodePoint(127397 + ch.charCodeAt(0))).join('');
}