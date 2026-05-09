export function fmtLPA(n: number): string {
  if (n === 0) return '—';
  if (n >= 100) return `₹${(n / 100).toFixed(1)}Cr`;
  return `₹${n % 1 === 0 ? n : n.toFixed(1)}L`;
}

export function fmtDiff(n: number): string {
  const abs = Math.abs(n);
  const str = fmtLPA(abs);
  if (n === 0) return '—';
  return n > 0 ? `+${str}` : `-${str}`;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
