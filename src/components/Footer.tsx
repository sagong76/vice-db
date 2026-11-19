import React from 'react';

export function Footer() {
  return (
    <footer className="bg-[#0b0e14] border-t border-[#262f45] text-[#94a3b8] text-xs py-6 px-4 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left max-w-3xl leading-relaxed">
          <p className="text-slate-300 font-medium mb-1">
            © 2026 VICE.DB (gta6vicedb.com). All rights reserved.
          </p>
          <p>
            VICE.DB is an independent, unofficial fan-made database and interactive map for Grand Theft Auto VI and is not affiliated with, endorsed, or sponsored by Rockstar Games or Take-Two Interactive Software, Inc. All game trademarks belong to their respective owners. Select community data is adapted under CC BY-SA 3.0 with attribution to{' '}
            <a
              href="https://gta.fandom.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00f0ff] hover:underline"
            >
              GTA Wiki
            </a>
            .
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 font-medium shrink-0">
          <a
            href="/privacy.html"
            className="text-[#00f0ff] hover:text-[#ff2a85] transition-colors"
          >
            Privacy Policy
          </a>
          <span className="text-[#262f45]">|</span>
          <a
            href="/terms.html"
            className="text-[#00f0ff] hover:text-[#ff2a85] transition-colors"
          >
            Terms &amp; Disclaimer
          </a>
          <span className="text-[#262f45]">|</span>
          <a
            href="/cookie.html"
            className="text-[#00f0ff] hover:text-[#ff2a85] transition-colors"
          >
            Cookie Policy
          </a>
          <span className="text-[#262f45]">|</span>
          <a
            href="/contact.html"
            className="text-[#00f0ff] hover:text-[#ff2a85] transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
