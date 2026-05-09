'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { fmtLPA } from '@/lib/format';
import { LevelBadge, LEVEL_OPTIONS } from '@/components/LevelBadge';
import { SubmitModal } from '@/components/SubmitModal';
import type { Salary, SalaryResponse } from '@/types';

const PAGE_SIZE = 20;

type SortField = 'total_compensation' | 'base_salary' | 'experience_years';
type SortOrder = 'asc' | 'desc';

function SalariesContent() {
  const router = useRouter();
  const params = useSearchParams();

  const [data, setData] = useState<SalaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [company, setCompany] = useState(params.get('company') ?? '');
  const [role, setRole] = useState(params.get('role') ?? '');
  const [level, setLevel] = useState(params.get('level') ?? '');
  const [location, setLocation] = useState(params.get('location') ?? '');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortField>('total_compensation');
  const [order, setOrder] = useState<SortOrder>('desc');

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showSubmit, setShowSubmit] = useState(params.get('submit') === '1');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSalaries = useCallback(async (filters: Record<string, string | number>) => {
    setLoading(true);
    setError('');
    try {
      const result = await api.getSalaries({ ...filters, limit: PAGE_SIZE });
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load salaries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSalaries({ company, role, level, location, page, sort, order });
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [company, role, level, location, page, sort, order, fetchSalaries]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 2) next.add(id);
      return next;
    });
  };

  const handleCompare = () => {
    const [a, b] = Array.from(selected);
    router.push(`/compare?ids=${a},${b}`);
  };

  const clearFilters = () => {
    setCompany(''); setRole(''); setLevel(''); setLocation(''); setPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sort === field) {
      setOrder(o => o === 'desc' ? 'asc' : 'desc');
    } else {
      setSort(field);
      setOrder('desc');
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort !== field) return <span className="ml-1 text-zinc-600">↕</span>;
    return <span className="ml-1 text-indigo-400">{order === 'desc' ? '↓' : '↑'}</span>;
  };

  const hasFilters = company || role || level || location;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Salary Table</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {data ? `${data.meta.total} data points` : 'Loading…'}
          </p>
        </div>
        <button
          onClick={() => setShowSubmit(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          + Submit Salary
        </button>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <FilterInput label="Company" value={company} onChange={(v) => { setCompany(v); setPage(1); }} placeholder="e.g. google" />
          <FilterInput label="Role" value={role} onChange={(v) => { setRole(v); setPage(1); }} placeholder="e.g. software engineer" />
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Level</label>
            <select
              value={level}
              onChange={(e) => { setLevel(e.target.value); setPage(1); }}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All levels</option>
              {LEVEL_OPTIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <FilterInput label="Location" value={location} onChange={(v) => { setLocation(v); setPage(1); }} placeholder="e.g. bangalore" />
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="mt-3 text-xs text-zinc-400 hover:text-white transition-colors">
            × Clear filters
          </button>
        )}
      </div>

      {/* Compare bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between bg-indigo-950 border border-indigo-700 rounded-xl px-4 py-3">
          <p className="text-sm text-indigo-200">
            {selected.size === 1 ? 'Select one more salary to compare' : '2 salaries selected — ready to compare'}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setSelected(new Set())} className="text-xs text-indigo-400 hover:text-white">
              Clear
            </button>
            {selected.size === 2 && (
              <button
                onClick={handleCompare}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-md transition-colors"
              >
                Compare →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      {error ? (
        <div className="text-center py-16 text-red-400 bg-red-950/20 border border-red-800 rounded-xl">
          {error}
        </div>
      ) : loading ? (
        <LoadingSkeleton />
      ) : data && data.data.length === 0 ? (
        <EmptyState onClear={clearFilters} hasFilters={!!hasFilters} />
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500 uppercase tracking-wide">
                  <th className="w-8 px-4 py-3" />
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Location</th>
                  <th
                    className="px-4 py-3 cursor-pointer select-none hover:text-zinc-300 transition-colors"
                    onClick={() => handleSort('experience_years')}
                    title="Sort by experience"
                  >
                    Exp. <SortIcon field="experience_years" />
                  </th>
                  <th
                    className="px-4 py-3 text-right cursor-pointer select-none hover:text-zinc-300 transition-colors"
                    onClick={() => handleSort('base_salary')}
                    title="Sort by base salary"
                  >
                    Base <SortIcon field="base_salary" />
                  </th>
                  <th className="px-4 py-3 text-right">Bonus</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th
                    className="px-4 py-3 text-right font-bold text-zinc-300 cursor-pointer select-none hover:text-white transition-colors"
                    onClick={() => handleSort('total_compensation')}
                    title="Sort by total compensation"
                  >
                    Total TC <SortIcon field="total_compensation" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {data?.data.map((s: Salary) => {
                  const isSelected = selected.has(s.id);
                  const maxed = selected.size === 2 && !isSelected;
                  return (
                    <tr
                      key={s.id}
                      className={`salary-row transition-colors ${isSelected ? 'bg-indigo-950/30' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={maxed}
                          onChange={() => toggleSelect(s.id)}
                          className="accent-indigo-500 w-4 h-4 cursor-pointer disabled:opacity-30"
                          title={maxed ? 'Deselect one to pick another' : 'Select to compare'}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/company/${s.company}`}
                          className="font-medium text-white capitalize hover:text-indigo-400 transition-colors"
                        >
                          {s.company}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-zinc-300 max-w-[180px] truncate">{s.role}</td>
                      <td className="px-4 py-3"><LevelBadge level={s.level} /></td>
                      <td className="px-4 py-3 text-zinc-400">{s.location}</td>
                      <td className="px-4 py-3 text-zinc-400">{s.experience_years}y</td>
                      <td className="px-4 py-3 text-right text-zinc-300 font-mono">{fmtLPA(s.base_salary)}</td>
                      <td className="px-4 py-3 text-right text-zinc-400 font-mono">{fmtLPA(s.bonus)}</td>
                      <td className="px-4 py-3 text-right text-zinc-400 font-mono">{fmtLPA(s.stock)}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-400 font-mono">
                        {fmtLPA(s.total_compensation)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.meta.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
              <p className="text-xs text-zinc-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.meta.total)} of {data.meta.total}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 text-xs rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 transition-colors"
                >
                  ← Prev
                </button>
                <span className="px-3 py-1 text-xs text-zinc-400">
                  {page} / {data.meta.pages}
                </span>
                <button
                  disabled={page === data.meta.pages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 text-xs rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showSubmit && (
        <SubmitModal
          onClose={() => setShowSubmit(false)}
          onSuccess={() => {
            setShowSubmit(false);
            fetchSalaries({ company, role, level, location, page, sort, order });
          }}
        />
      )}
    </div>
  );
}

export default function SalariesPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-zinc-500 text-sm">Loading…</div>}>
      <SalariesContent />
    </Suspense>
  );
}

function FilterInput({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-zinc-400 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden animate-pulse">
      <div className="h-10 bg-zinc-800 border-b border-zinc-700" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-zinc-800">
          <div className="h-4 w-4 bg-zinc-700 rounded" />
          <div className="h-4 w-24 bg-zinc-700 rounded" />
          <div className="h-4 flex-1 bg-zinc-800 rounded" />
          <div className="h-4 w-12 bg-zinc-700 rounded" />
          <div className="h-4 w-16 bg-zinc-800 rounded" />
          <div className="h-4 w-20 bg-zinc-700 rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onClear, hasFilters }: { onClear: () => void; hasFilters: boolean }) {
  return (
    <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-xl">
      <p className="text-4xl mb-3">🔍</p>
      <p className="text-zinc-300 font-semibold">No salaries found</p>
      <p className="text-zinc-500 text-sm mt-1">
        {hasFilters ? 'Try adjusting or clearing your filters.' : 'No data yet — be the first to submit!'}
      </p>
      {hasFilters && (
        <button onClick={onClear} className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm">
          Clear filters
        </button>
      )}
    </div>
  );
}
