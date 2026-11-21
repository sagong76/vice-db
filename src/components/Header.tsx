import { Map, Car, GitCompare, Search } from 'lucide-react';
import { memo } from 'react';
import type { ViewTab } from '../types';
import { isPlainClick } from '../router';

interface HeaderProps {
  activeTab: ViewTab | null;
  onTabChange: (tab: ViewTab) => void;
  search: string;
  onSearch: (q: string) => void;
}

const HREF: Record<ViewTab, string> = { map: '/', vehicles: '/vehicles/', compare: '/compare/' };

const TABS: { id: ViewTab; label: string; icon: typeof Map }[] = [
  { id: 'map', label: 'Interactive Map', icon: Map },
  { id: 'vehicles', label: 'Vehicle DB', icon: Car },
  { id: 'compare', label: 'Compare Cars', icon: GitCompare },
];

function HeaderBase({ activeTab, onTabChange, search, onSearch }: HeaderProps) {
  const go = (t: ViewTab) => (e: React.MouseEvent) => {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    onTabChange(t);
  };
  return (
    <header className="sticky top-0 z-40 h-14 border-b border-ink-600 bg-ink-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1600px] items-center gap-3 px-3 sm:px-5">
        {/* Logo */}
        <a
          href="/"
          onClick={go('map')}
          className="flex shrink-0 items-center gap-2 pr-2"
          aria-label="VICE.DB home"
        >
          <span className="relative flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-pink-neon to-cyan-neon">
            <span className="absolute inset-0 rounded-md bg-ink-950 [mask:linear-gradient(#000,#000)]" />
            <span className="relative font-display text-sm font-bold tracking-tight text-white">V</span>
          </span>
          <span className="hidden font-display text-base font-bold tracking-wider text-white sm:block">
            VICE<span className="text-pink-neon">.</span>DB
          </span>
        </a>

        {/* Tabs */}
        <nav className="hidden items-center gap-1 rounded-lg border border-ink-700 bg-ink-850 p-1 md:flex">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <a
                key={t.id}
                href={HREF[t.id]}
                onClick={go(t.id)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? 'bg-gradient-to-r from-pink-neon/20 to-cyan-neon/20 text-white shadow-[inset_0_0_0_1px_rgba(255,42,133,0.4)]'
                    : 'text-ink-200 hover:bg-ink-700 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-pink-neon' : ''}`} />
                {t.label}
              </a>
            );
          })}
        </nav>

        {/* Search */}
        <div className="relative ml-auto flex-1 sm:max-w-sm md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search vehicles, pins, regions..."
            className="w-full rounded-lg border border-ink-600 bg-ink-850 py-2 pl-9 pr-3 text-sm text-white placeholder:text-ink-300 outline-none transition focus:border-pink-neon/60 focus:shadow-[0_0_0_3px_rgba(255,42,133,0.15)]"
            aria-label="Global search"
          />
        </div>

      </div>

      {/* Mobile tabs */}
      <nav className="flex items-center gap-1 border-t border-ink-700 bg-ink-900 px-2 py-1 md:hidden">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <a
              key={t.id}
              href={HREF[t.id]}
              onClick={go(t.id)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition ${
                active ? 'bg-ink-700 text-white' : 'text-ink-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label.split(' ')[0]}
            </a>
          );
        })}
      </nav>
    </header>
  );
}

export const Header = memo(HeaderBase);
