const CANONICAL_COMPANY_MAP: Record<string, string> = {
  'google india': 'google',
  'google llc': 'google',
  'alphabet': 'google',
  'alphabet inc': 'google',
  'microsoft india': 'microsoft',
  'microsoft corporation': 'microsoft',
  'amazon india': 'amazon',
  'amazon web services': 'aws',
  'meta platforms': 'meta',
  'facebook': 'meta',
  'meta platforms inc': 'meta',
  'flipkart internet': 'flipkart',
  'walmart flipkart': 'flipkart',
  'phonepe private limited': 'phonepe',
  'phone pe': 'phonepe',
  'razorpay software': 'razorpay',
};

export function normalizeCompany(raw: string): string {
  const cleaned = raw.toLowerCase().trim().replace(/\s+/g, ' ');
  return CANONICAL_COMPANY_MAP[cleaned] ?? cleaned;
}

const LEVEL_ALIAS_MAP: Record<string, string> = {
  // SDE variants
  'SDE-1': 'L3', 'SDE1': 'L3', 'SDE 1': 'L3', 'SDE I': 'L3',
  'SDE-2': 'L4', 'SDE2': 'L4', 'SDE 2': 'L4', 'SDE II': 'L4',
  'SDE-3': 'L5', 'SDE3': 'L5', 'SDE 3': 'L5', 'SDE III': 'L5',
  // SWE variants
  'SWE I': 'L3', 'SWE1': 'L3', 'SOFTWARE ENGINEER I': 'L3', 'ENGINEER I': 'L3',
  'SWE II': 'L4', 'SWE2': 'L4', 'SOFTWARE ENGINEER II': 'L4', 'ENGINEER II': 'L4', 'SENIOR SWE': 'L4',
  'SWE III': 'L5', 'SWE3': 'L5', 'SENIOR SOFTWARE ENGINEER': 'L5', 'SENIOR ENGINEER': 'L5',
  // Staff / Principal
  'STAFF': 'L6', 'STAFF SDE': 'L6', 'STAFF ENGINEER': 'L6', 'STAFF SOFTWARE ENGINEER': 'L6',
  'SENIOR STAFF': 'L7', 'PRINCIPAL': 'L7', 'PRINCIPAL ENGINEER': 'L7', 'PRINCIPAL SOFTWARE ENGINEER': 'L7',
  // Distinguished
  'DISTINGUISHED': 'L8', 'FELLOW': 'L8', 'VP ENGINEER': 'L8',
};

const VALID_LEVELS = new Set(['L3', 'L4', 'L5', 'L6', 'L7', 'L8']);

export function normalizeLevel(raw: string): string | null {
  const upper = raw.toUpperCase().trim();
  if (VALID_LEVELS.has(upper)) return upper;
  return LEVEL_ALIAS_MAP[upper] ?? null;
}

export function computeTotal(base: number, bonus: number, stock: number): number {
  return Math.round((base + bonus + stock) * 100) / 100;
}

export function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}
