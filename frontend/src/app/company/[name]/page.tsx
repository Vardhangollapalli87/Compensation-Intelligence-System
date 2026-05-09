import { notFound } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { fmtLPA } from '@/lib/format';
import { LevelBadge } from '@/components/LevelBadge';

const LEVEL_ORDER = ['L3', 'L4', 'L5', 'L6', 'L7', 'L8'];

const LEVEL_BAR_COLORS: Record<string, string> = {
  L3: 'bg-blue-500',
  L4: 'bg-amber-500',
  L5: 'bg-emerald-500',
  L6: 'bg-purple-500',
  L7: 'bg-rose-500',
  L8: 'bg-red-500',
};

interface Props {
  params: { name: string };
}

export default async function CompanyPage({ params }: Props) {
  let company;
  try {
    company = await api.getCompany(decodeURIComponent(params.name));
  } catch {
    notFound();
  }

  const { stats, salaries } = company;
  const totalEntries = stats.total_entries;

  const sortedLevels = LEVEL_ORDER.filter((l) => stats.level_distribution[l] !== undefined);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/salaries" className="hover:text-zinc-300 transition-colors">Salaries</Link>
        <span>/</span>
        <span className="text-white capitalize">{company.company}</span>
      </div>

      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h1 className="text-3xl font-bold text-white capitalize">{company.company}</h1>
        <p className="text-zinc-400 mt-1">{totalEntries} salary data points</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-6">
          <StatCard label="Median Total Comp" value={fmtLPA(stats.median_compensation)} highlight />
          <StatCard label="Median Base Salary" value={fmtLPA(stats.median_base)} />
          <StatCard label="Data Points" value={totalEntries.toString()} />
        </div>
      </div>

      {/* Level distribution */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Level Distribution</h2>
        <div className="space-y-3">
          {sortedLevels.map((l) => {
            const count = stats.level_distribution[l] ?? 0;
            const pct = Math.round((count / totalEntries) * 100);
            return (
              <div key={l} className="flex items-center gap-3">
                <div className="w-8">
                  <LevelBadge level={l} />
                </div>
                <div className="flex-1 bg-zinc-800 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${LEVEL_BAR_COLORS[l] ?? 'bg-zinc-500'}`}
                    style={{ width: `${Math.max(pct, 3)}%` }}
                  />
                </div>
                <span className="text-sm text-zinc-400 w-20 text-right">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Salary list */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="font-semibold text-white">All Salaries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500 uppercase tracking-wide">
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Exp.</th>
                <th className="px-4 py-3 text-right">Base</th>
                <th className="px-4 py-3 text-right">Bonus</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right font-bold text-zinc-300">Total TC</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {salaries.map((s) => (
                <tr key={s.id} className="salary-row">
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
                  <td className="px-4 py-3">
                    <Link
                      href={`/compare?preload=${s.id}`}
                      className="text-xs text-indigo-400 hover:text-indigo-300 whitespace-nowrap"
                    >
                      Compare →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-zinc-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 font-mono ${highlight ? 'text-emerald-400' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}
