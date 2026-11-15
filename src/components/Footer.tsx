import { memo, useState } from 'react';
import { Shield, FileText, Cookie, Mail, Github } from 'lucide-react';
import type { LegalPage } from './LegalModal';

interface FooterProps {
  onOpenLegal: (page: LegalPage) => void;
}

const LINKS: { page: LegalPage; label: string; icon: typeof Shield }[] = [
  { page: 'privacy', label: 'Privacy Policy', icon: Shield },
  { page: 'terms', label: 'Terms of Service', icon: FileText },
  { page: 'cookie', label: 'Cookie Notice', icon: Cookie },
  { page: 'contact', label: 'Contact Us', icon: Mail },
];

function FooterBase({ onOpenLegal }: FooterProps) {
  const [year] = useState(() => new Date().getFullYear());

  return (
    <footer className="border-t border-ink-700 bg-ink-950 px-5 py-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Brand */}
        <div className="max-w-sm">
          <p className="font-display text-lg font-bold text-white">
            VICE<span className="text-pink-neon">.</span>DB
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-300">
            The unofficial GTA 6 interactive map and vehicle database. Explore Leonida, find free cars
            and collectibles, and compare every vehicle's specs in one place.
          </p>
          <p className="mt-3 text-[11px] text-ink-400">
            Fan-made project. Not affiliated with Rockstar Games or Take-Two Interactive. All vehicle
            names and trademarks belong to their respective owners.
          </p>
        </div>

        {/* Legal links */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-ink-200">Legal</h3>
          <nav className="flex flex-col gap-2">
            {LINKS.map((l) => {
              const Icon = l.icon;
              return (
                <button
                  key={l.page}
                  onClick={() => onOpenLegal(l.page)}
                  className="group flex items-center gap-2 text-left text-sm text-ink-200 transition hover:text-cyan-neon"
                >
                  <Icon className="h-3.5 w-3.5 text-ink-400 transition group-hover:text-cyan-neon" />
                  {l.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Ad disclosure */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-ink-200">
            Advertising Disclosure
          </h3>
          <p className="max-w-xs text-[11px] leading-relaxed text-ink-400">
            This site displays ads via Google AdSense. We use cookies to personalize content and ads,
            to provide social media features, and to analyze our traffic. See our Cookie Notice for
            opt-out options.
          </p>
          <div className="flex items-center gap-3 text-ink-400">
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-ink-300 underline transition hover:text-cyan-neon"
            >
              Ad Settings
            </a>
            <span className="text-ink-600">|</span>
            <a
              href="https://www.aboutads.info/choices"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-ink-300 underline transition hover:text-cyan-neon"
            >
              Opt Out
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto mt-6 flex max-w-[1400px] flex-col items-center justify-between gap-2 border-t border-ink-700 pt-5 text-center sm:flex-row sm:text-left">
        <p className="text-[11px] text-ink-400">
          &copy; {year} VICE.DB. All rights reserved. Not affiliated with Rockstar Games.
        </p>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-ink-400">Built for fans, by fans</span>
          <Github className="h-3.5 w-3.5 text-ink-500" />
        </div>
      </div>
    </footer>
  );
}

export const Footer = memo(FooterBase);
