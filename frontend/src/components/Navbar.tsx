'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/salaries', label: 'Salaries' },
  { href: '/compare', label: 'Compare' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-white font-bold text-lg tracking-tight">
            LevelComp
            <span className="text-indigo-400">.in</span>
          </span>
          <span className="hidden sm:inline text-xs text-zinc-500 border border-zinc-700 rounded px-1.5 py-0.5">
            BETA
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/salaries?submit=1"
            className="ml-2 px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            + Submit
          </Link>
        </div>
      </div>
    </nav>
  );
}
