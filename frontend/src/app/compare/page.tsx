'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { fmtLPA, fmtDiff } from '@/lib/format';
import { LevelBadge, LEVEL_OPTIONS } from '@/components/LevelBadge';
import type { CompareResult, Salary, SalaryResponse } from '@/types';

function CompareContent() {
  const params = useSearchParams();

  const [result, setResult] = useState<CompareResult | null>(null);
  const [compareError, setCompareError] = useState('');
  const [compareLoading, setCompareLoading] = useState(false);

  // Salary picker state
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [pickerLoading, setPickerLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [selectedA, setSelectedA] = useState<Salary | null>(null);
  const [selectedB, setSelectedB] = useState<Salary | null>(null);

  // Load all salaries for picker (up to 100)
  const loadPickerSalaries = useCallback(async () => {
    setPickerLoading(true);
    try {
      const res: SalaryResponse = await api.getSalaries({ limit: 100, sort: 'total_compensation', order: 'desc' });
      setSalaries(res.data);
    } catch {
      // silently fail - picker just won't show
    } finally {
      setPickerLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPickerSalaries();
  }, [loadPickerSalaries]);

  // Handle ?ids=a,b URL param (coming from salary table)
  useEffect(() => {
    const ids = params.get('ids');
    const preload = params.get('preload');

    if (ids) {
      const [a, b] = ids.split(',').map(s => s.trim());
      if (a && b) {
        doCompare(a, b);
      }
    }

    // preload= means user clicked "Compare →" from company page; pre-select slot A
    if (preload && !ids) {
      api.getSalaries({ limit: 100 }).then(res => {
        const found = res.data.find((s: Salary) => s.id === preload);
        if (found) setSelectedA(found);
      }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doCompare = async (idA: string, idB: string) => {
    setCompareLoading(true);
    setCompareError('');
    setResult(null);
    try {
      const r = await api.compare(idA, idB);
      setResult(r);
    } catch (e) {
      setCompareError(e instanceof Error ? e.message : 'Comparison failed');
    } finally {
      setCompareLoading(false);
    }
  };

  const handleCompare = () => {
    if (selectedA && selectedB) doCompare(selectedA.id, selectedB.id);
  };

  const filteredSalaries = salaries.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.company.includes(q) || s.role.toLowerCase().includes(q) || s.location.toLowerCase().includes(q);
    const matchLevel = !levelFilter || s.level === levelFilter;
    return matchSearch && matchLevel;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Compare Salaries</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Select two salary entries to compare side by side</p>
      </div>

      {/* Selector panels */}
      <div className="grid lg:grid-cols-2 gap-4">
        <SelectorPanel
          label="Salary A"
          selected={selectedA}
          onClear={() => { setSelectedA(null); setResult(null); }}
          salaries={filteredSalaries}
          otherSelected={selectedB}
          onSelect={setSelectedA}
          loading={pickerLoading}
          search={search}
          setSearch={setSearch}
          levelFilter={levelFilter}
          setLevelFilter={setLevelFilter}
          accentColor="indigo"
        />
        <SelectorPanel
          label="Salary B"
          selected={selectedB}
          onClear={() => { setSelectedB(null); setResult(null); }}
          salaries={filteredSalaries}
          otherSelected={selectedA}
          onSelect={setSelectedB}
          loading={pickerLoading}
          search={search}
          setSearch={setSearch}
          levelFilter={levelFilter}
          setLevelFilter={setLevelFilter}
          accentColor="amber"
        />
      </div>

      {/* Compare button */}
      {selectedA && selectedB && !result && (
        <div className="text-center">
          <button
            onClick={handleCompare}
            disabled={compareLoading}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-base"
          >
            {compareLoading ? 'Comparing…' : '⚖️ Compare Now'}
          </button>
        </div>
      )}

      {compareError && (
        <div className="text-center py-6 text-red-400 bg-red-950/20 border border-red-800 rounded-xl">
          {compareError}
        </div>
      )}

      {/* Comparison result */}
      {result && (
        <CompareTable result={result} onReset={() => { setResult(null); setSelectedA(null); setSelectedB(null); }} />
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-zinc-500 text-sm">Loading…</div>}>
      <CompareContent />
    </Suspense>
  );
}

/* ─────────────────────────────────────────────── */

function SelectorPanel({
  label, selected, onClear, salaries, otherSelected, onSelect,
  loading, search, setSearch, levelFilter, setLevelFilter, accentColor,
}: {
  label: string;
  selected: Salary | null;
  onClear: () => void;
  salaries: Salary[];
  otherSelected: Salary | null;
  onSelect: (s: Salary) => void;
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  levelFilter: string;
  setLevelFilter: (v: string) => void;
  accentColor: 'indigo' | 'amber';
}) {
  const borderColor = accentColor === 'indigo' ? 'border-indigo-700' : 'border-amber-700';
  const labelColor = accentColor === 'indigo' ? 'text-indigo-400' : 'text-amber-400';

  if (selected) {
    return (
      <div className={`bg-zinc-900 border-2 ${borderColor} rounded-xl p-5`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-bold uppercase tracking-wider ${labelColor}`}>{label}</span>
          <button onClick={onClear} className="text-xs text-zinc-400 hover:text-white">× Change</button>
        </div>
        <SalaryCard salary={selected} />
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-bold uppercase tracking-wider ${labelColor}`}>{label}</span>
        <span className="text-xs text-zinc-500">Click a row to select</span>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company, role…"
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none"
        >
          <option value="">All</option>
          {LEVEL_OPTIONS.map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>

      {/* List */}
      <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
        {loading ? (
          <div className="text-center py-8 text-zinc-500 text-sm">Loading…</div>
        ) : salaries.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm">No results</div>
        ) : (
          salaries.map((s) => {
            const isOther = otherSelected?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => !isOther && onSelect(s)}
                disabled={isOther}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors text-sm ${
                  isOther
                    ? 'border-zinc-700 opacity-40 cursor-not-allowed'
                    : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white capitalize">{s.company}</span>
                  <div className="flex items-center gap-2">
                    <LevelBadge level={s.level} />
                    <span className="text-emerald-400 font-mono font-bold">{fmtLPA(s.total_compensation)}</span>
                  </div>
                </div>
                <p className="text-zinc-400 text-xs mt-0.5 truncate">{s.role} · {s.location}</p>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function SalaryCard({ salary: s }: { salary: Salary }) {
  return (
    <div className="space-y-2">
      <div>
        <Link href={`/company/${s.company}`} className="font-bold text-white text-lg capitalize hover:text-indigo-400">
          {s.company}
        </Link>
        <p className="text-zinc-400 text-sm">{s.role}</p>
      </div>
      <div className="flex items-center gap-2">
        <LevelBadge level={s.level} />
        <span className="text-zinc-400 text-sm">{s.location} · {s.experience_years}y exp</span>
      </div>
      <div className="grid grid-cols-3 gap-3 pt-2">
        <CompactStat label="Base" value={fmtLPA(s.base_salary)} />
        <CompactStat label="Bonus" value={fmtLPA(s.bonus)} />
        <CompactStat label="Stock" value={fmtLPA(s.stock)} />
      </div>
      <div className="bg-zinc-800 rounded-lg px-4 py-3 text-center">
        <p className="text-xs text-zinc-500">Total Compensation</p>
        <p className="text-2xl font-bold text-emerald-400 font-mono mt-0.5">{fmtLPA(s.total_compensation)}</p>
      </div>
    </div>
  );
}

function CompactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-800 rounded px-3 py-2 text-center">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-sm font-mono font-semibold text-white mt-0.5">{value}</p>
    </div>
  );
}

function CompareTable({ result: r, onReset }: { result: CompareResult; onReset: () => void }) {
  const rows: { label: string; a: string; b: string; diff: number }[] = [
    { label: 'Base Salary', a: fmtLPA(r.salary_a.base_salary), b: fmtLPA(r.salary_b.base_salary), diff: r.comparison.base_diff },
    { label: 'Annual Bonus', a: fmtLPA(r.salary_a.bonus), b: fmtLPA(r.salary_b.bonus), diff: r.comparison.bonus_diff },
    { label: 'Stock / ESOP', a: fmtLPA(r.salary_a.stock), b: fmtLPA(r.salary_b.stock), diff: r.comparison.stock_diff },
    { label: 'Total Comp', a: fmtLPA(r.salary_a.total_compensation), b: fmtLPA(r.salary_b.total_compensation), diff: r.comparison.total_diff },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-3 text-center border-b border-zinc-800">
        <div className="px-4 py-4 border-r border-zinc-800">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Salary A</span>
          <p className="font-bold text-white capitalize mt-1">{r.salary_a.company}</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <LevelBadge level={r.salary_a.level} />
            <span className="text-xs text-zinc-400">{r.salary_a.location}</span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 truncate px-2">{r.salary_a.role}</p>
        </div>

        <div className="px-4 py-4 flex items-center justify-center">
          <div className="text-center">
            <p className="text-zinc-500 text-xs">VS</p>
            <p className="text-xs text-zinc-400 mt-2 max-w-[140px]">{r.comparison.level_difference}</p>
          </div>
        </div>

        <div className="px-4 py-4 border-l border-zinc-800">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Salary B</span>
          <p className="font-bold text-white capitalize mt-1">{r.salary_b.company}</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <LevelBadge level={r.salary_b.level} />
            <span className="text-xs text-zinc-400">{r.salary_b.location}</span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 truncate px-2">{r.salary_b.role}</p>
        </div>
      </div>

      {/* Comparison rows */}
      {rows.map((row, i) => {
        const isTotal = row.label === 'Total Comp';
        const winner = row.diff > 0 ? 'a' : row.diff < 0 ? 'b' : null;
        return (
          <div
            key={row.label}
            className={`grid grid-cols-3 text-center border-b border-zinc-800 last:border-0 ${isTotal ? 'bg-zinc-800/40' : ''}`}
          >
            <div className={`px-4 py-4 border-r border-zinc-800 ${winner === 'a' ? 'bg-emerald-950/30' : ''}`}>
              <p className={`font-mono font-bold ${isTotal ? 'text-xl text-emerald-400' : 'text-zinc-200'}`}>
                {row.a}
              </p>
              {winner === 'a' && (
                <span className="text-xs text-emerald-400">{fmtDiff(row.diff)} higher</span>
              )}
            </div>

            <div className="px-4 py-4 flex items-center justify-center">
              <span className={`text-xs ${isTotal ? 'font-bold text-zinc-300' : 'text-zinc-500'}`}>
                {row.label}
              </span>
            </div>

            <div className={`px-4 py-4 border-l border-zinc-800 ${winner === 'b' ? 'bg-emerald-950/30' : ''}`}>
              <p className={`font-mono font-bold ${isTotal ? 'text-xl text-emerald-400' : 'text-zinc-200'}`}>
                {row.b}
              </p>
              {winner === 'b' && (
                <span className="text-xs text-emerald-400">{fmtDiff(-row.diff)} higher</span>
              )}
            </div>
          </div>
        );
      })}

      <div className="px-6 py-4 border-t border-zinc-800 flex justify-between items-center">
        <p className="text-xs text-zinc-500">Level difference: {r.comparison.level_difference}</p>
        <button onClick={onReset} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
          ↺ New comparison
        </button>
      </div>
    </div>
  );
}
