const LEVEL_STYLES: Record<string, string> = {
  L3: 'bg-blue-950 text-blue-300 ring-1 ring-blue-800',
  L4: 'bg-amber-950 text-amber-300 ring-1 ring-amber-800',
  L5: 'bg-emerald-950 text-emerald-300 ring-1 ring-emerald-800',
  L6: 'bg-purple-950 text-purple-300 ring-1 ring-purple-800',
  L7: 'bg-rose-950 text-rose-300 ring-1 ring-rose-800',
  L8: 'bg-red-950 text-red-300 ring-1 ring-red-800',
};

export function LevelBadge({ level }: { level: string }) {
  const cls = LEVEL_STYLES[level] ?? 'bg-zinc-800 text-zinc-300 ring-1 ring-zinc-600';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${cls}`}>
      {level}
    </span>
  );
}

export const LEVEL_OPTIONS = ['L3', 'L4', 'L5', 'L6', 'L7', 'L8'];
