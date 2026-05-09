import Link from 'next/link';
import { api } from '@/lib/api';
import { fmtLPA } from '@/lib/format';

async function getStats() {
  try {
    const [salaries, companies] = await Promise.all([
      api.getSalaries({ limit: 1 }),
      api.getCompanies(),
    ]);
    return { totalSalaries: salaries.meta.total, totalCompanies: companies.length };
  } catch {
    return { totalSalaries: 0, totalCompanies: 0 };
  }
}

async function getTopCompanies() {
  try {
    const companies = await api.getCompanies();
    return companies.slice(0, 6);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [stats, topCompanies] = await Promise.all([getStats(), getTopCompanies()]);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="pt-8 pb-4 text-center space-y-6">
        <div className="inline-flex items-center gap-2 text-xs text-indigo-400 border border-indigo-800 bg-indigo-950/40 rounded-full px-3 py-1.5">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          Level-standardized • India-first • Open data
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
          Know Your Worth.
          <br />
          <span className="text-indigo-400">By Level.</span>
        </h1>

        <p className="text-zinc-400 max-w-xl mx-auto text-lg">
          Real compensation data for Indian tech — structured by level, not title.
          Compare L4 at Google vs L4 at Flipkart. Make better decisions.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/salaries"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors"
          >
            Browse Salaries
          </Link>
          <Link
            href="/compare"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg border border-zinc-700 transition-colors"
          >
            Compare Offers
          </Link>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap justify-center gap-8 pt-4">
          {[
            { label: 'Salary Data Points', value: stats.totalSalaries.toLocaleString() },
            { label: 'Companies Tracked', value: stats.totalCompanies.toString() },
            { label: 'Levels Standardized', value: 'L3–L8' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Level legend */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Level Standardization</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { level: 'L3', desc: 'Junior / SDE-1', color: 'text-blue-300', bg: 'bg-blue-950 border-blue-800' },
            { level: 'L4', desc: 'Mid / SDE-2', color: 'text-amber-300', bg: 'bg-amber-950 border-amber-800' },
            { level: 'L5', desc: 'Senior / SDE-3', color: 'text-emerald-300', bg: 'bg-emerald-950 border-emerald-800' },
            { level: 'L6', desc: 'Staff Engineer', color: 'text-purple-300', bg: 'bg-purple-950 border-purple-800' },
            { level: 'L7', desc: 'Principal', color: 'text-rose-300', bg: 'bg-rose-950 border-rose-800' },
            { level: 'L8', desc: 'Distinguished', color: 'text-red-300', bg: 'bg-red-950 border-red-800' },
          ].map((l) => (
            <div key={l.level} className={`${l.bg} border rounded-lg p-3 text-center`}>
              <p className={`text-xl font-bold ${l.color}`}>{l.level}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{l.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-4">
          SDE-1 maps to L3, SDE-2 → L4, SDE-3 → L5, Staff → L6, Principal → L7. Compare across companies by level — not title.
        </p>
      </section>

      {/* Top companies */}
      {topCompanies.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Top Companies</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {topCompanies.map((c) => (
              <Link
                key={c.company}
                href={`/company/${c.company}`}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 transition-colors group"
              >
                <p className="font-semibold text-white capitalize group-hover:text-indigo-400 transition-colors">
                  {c.company}
                </p>
                <p className="text-sm text-zinc-400 mt-1">{c.count} data points</p>
                <p className="text-sm text-emerald-400 font-mono mt-0.5">
                  Avg {fmtLPA(c.avg_total_compensation)} TC
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Feature cards */}
      <section className="grid sm:grid-cols-3 gap-4">
        {[
          {
            title: 'Salary Table',
            desc: 'Filter by company, role, level, location. Sort by total comp. See what the market actually pays.',
            href: '/salaries',
            icon: '📊',
          },
          {
            title: 'Company Pages',
            desc: 'Median compensation, level distribution, and full salary breakdown per company.',
            href: '/salaries',
            icon: '🏢',
          },
          {
            title: 'Compare Offers',
            desc: 'Select any two salaries and compare base, bonus, stock, total, and level difference side by side.',
            href: '/compare',
            icon: '⚖️',
          },
        ].map((f) => (
          <Link
            key={f.title}
            href={f.href}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 transition-colors"
          >
            <div className="text-2xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-white mb-1">{f.title}</h3>
            <p className="text-sm text-zinc-400">{f.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
