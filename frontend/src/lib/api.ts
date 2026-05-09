import type { SalaryFilters, SalaryResponse, CompanyStats, CompanyListItem, CompareResult } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error ?? `Request failed: ${res.status}`);
  return json as T;
}

export function buildQuery(filters: SalaryFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v));
  });
  return params.toString();
}

export const api = {
  getSalaries: (filters: SalaryFilters = {}) =>
    apiFetch<SalaryResponse>(`/salaries?${buildQuery(filters)}`),

  getCompany: (name: string) =>
    apiFetch<CompanyStats>(`/company/${encodeURIComponent(name.toLowerCase())}`),

  getCompanies: () => apiFetch<CompanyListItem[]>('/companies'),

  compare: (idA: string, idB: string) =>
    apiFetch<CompareResult>(`/compare?ids=${idA},${idB}`),

  ingestSalary: (body: Record<string, unknown>) =>
    apiFetch('/ingest-salary', { method: 'POST', body: JSON.stringify(body) }),
};
