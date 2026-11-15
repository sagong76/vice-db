import { useEffect, useState } from 'react';
import { Mail, Shield, FileText, Cookie } from 'lucide-react';
import { Modal } from './Modal';

export type LegalPage = 'privacy' | 'terms' | 'cookie' | 'contact';

interface LegalModalProps {
  page: LegalPage | null;
  onClose: () => void;
}

const PAGE_META: Record<LegalPage, { title: string; icon: typeof Shield; updated: string }> = {
  privacy: { title: 'Privacy Policy', icon: Shield, updated: 'November 15, 2026' },
  terms: { title: 'Terms of Service', icon: FileText, updated: 'November 15, 2026' },
  cookie: { title: 'Cookie Notice', icon: Cookie, updated: 'November 15, 2026' },
  contact: { title: 'Contact Us', icon: Mail, updated: 'November 15, 2026' },
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-5 mb-2 font-display text-base font-semibold text-white">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-sm leading-relaxed text-ink-100">{children}</p>;
}
function UL({ children }: { children: React.ReactNode }) {
  return <ul className="mb-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-100">{children}</ul>;
}

export function LegalModal({ page, onClose }: LegalModalProps) {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    if (page) {
      document.title = `${PAGE_META[page].title} | VICE.DB - GTA 6 Map & Vehicle DB`;
    } else {
      document.title = 'VICE.DB - GTA 6 Interactive Map & Vehicle Database';
    }
    return () => {
      document.title = 'VICE.DB - GTA 6 Interactive Map & Vehicle Database';
    };
  }, [page]);

  if (!page) return null;
  const meta = PAGE_META[page];

  return (
    <Modal open={!!page} onClose={onClose} title={meta.title} maxWidth="max-w-2xl">
      <div className="max-h-[65vh] overflow-y-auto scrollbar-thin px-6 py-5">
        <p className="mb-4 text-xs text-ink-300">Last updated: {meta.updated}</p>

        {page === 'privacy' && (
          <div>
            <P>
              This Privacy Policy describes how VICE.DB ("we", "us", or "our") collects, uses, and
              protects your information when you visit our website. We are committed to complying with
              the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act
              (CCPA).
            </P>

            <H2>Information We Collect</H2>
            <P>We collect minimal information necessary to provide our services:</P>
            <UL>
              <li><strong>Local Storage Data:</strong> Your map progress ("found" pins) is stored locally in your browser. This data never leaves your device.</li>
              <li><strong>Usage Data:</strong> Aggregate, non-identifying analytics such as page views and approximate region, used to improve the site.</li>
              <li><strong>Advertising Data:</strong> Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites.</li>
            </UL>

            <H2>How We Use Your Information</H2>
            <UL>
              <li>To operate and maintain the interactive map and vehicle database.</li>
              <li>To remember your map progress between visits via browser localStorage.</li>
              <li>To display relevant advertising through Google AdSense.</li>
              <li>To improve content and user experience over time.</li>
            </UL>

            <H2>Google AdSense & Third-Party Cookies</H2>
            <P>
              We use Google AdSense to display advertisements. Third-party vendors, including Google,
              use cookies to serve ads based on a user's prior visits to this website or other websites.
              Google's use of advertising cookies enables it and its partners to serve ads to you based
              on your visit to this site and/or other sites on the internet.
            </P>
            <P>
              You may opt out of personalized advertising by visiting Google's{' '}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-neon underline hover:text-cyan-soft">
                Ads Settings
              </a>
              . You can also opt out of third-party vendors' use of cookies for personalized advertising
              by visiting{' '}
              <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-cyan-neon underline hover:text-cyan-soft">
                www.aboutads.info
              </a>
              .
            </P>

            <H2>Your Rights (GDPR)</H2>
            <P>If you are in the European Economic Area, you have the right to:</P>
            <UL>
              <li>Access the personal data we hold about you.</li>
              <li>Request correction or deletion of your personal data.</li>
              <li>Object to or restrict our processing of your data.</li>
              <li>Withdraw consent at any time without affecting the lawfulness of prior processing.</li>
              <li>Lodge a complaint with your local data protection authority.</li>
            </UL>

            <H2>Your Rights (CCPA)</H2>
            <P>If you are a California resident, you have the right to:</P>
            <UL>
              <li>Know what personal information we collect and how it is used.</li>
              <li>Request deletion of your personal information.</li>
              <li>Opt out of the sale or sharing of your personal information.</li>
              <li>Non-discrimination for exercising your privacy rights.</li>
            </UL>
            <P>We do not sell personal information.</P>

            <H2>Data Retention</H2>
            <P>
              Map progress is stored only in your browser's localStorage and persists until you clear
              browser data. We do not maintain server-side user accounts or profiles.
            </P>

            <H2>Children's Privacy</H2>
            <P>
              Our service is not directed to children under 13, and we do not knowingly collect personal
              information from children under 13.
            </P>

            <H2>Contact</H2>
            <P>
              For privacy questions or requests, use the Contact Us page or email{' '}
              <a href="mailto:privacy@vicedb.app" className="text-cyan-neon underline hover:text-cyan-soft">privacy@vicedb.app</a>.
            </P>
          </div>
        )}

        {page === 'terms' && (
          <div>
            <P>
              These Terms of Service ("Terms") govern your use of VICE.DB (the "Service"). By accessing
              or using the Service, you agree to be bound by these Terms.
            </P>

            <H2>Fan-Made Project & Trademarks</H2>
            <P>
              VICE.DB is an unofficial, fan-made project. It is not affiliated with, endorsed by, or
              sponsored by Rockstar Games, Take-Two Interactive, or any of their subsidiaries. All game
              titles, vehicle names, and trademarks belong to their respective owners. Content on this
              site is for informational and educational purposes only.
            </P>

            <H2>Use of the Service</H2>
            <P>You agree to use the Service only for lawful purposes and in a manner that does not:</P>
            <UL>
              <li>Infringe the rights of, or restrict the use of, the Service by any other user.</li>
              <li>Attempt to gain unauthorized access to any part of the Service.</li>
              <li>Use automated scripts, bots, or scrapers to extract data without permission.</li>
              <li>Distribute malware or harmful code through the Service.</li>
            </UL>

            <H2>Intellectual Property</H2>
            <P>
              The original content of this site - including its design, code, map interface, and written
              descriptions - is the property of VICE.DB. Game-related names and imagery are property of
              their respective owners and are referenced under fair use for informational purposes.
            </P>

            <H2>Advertising</H2>
            <P>
              The Service displays advertisements provided by Google AdSense and other third-party ad
              networks. We are not responsible for the content of third-party advertisements or the
              products and services they promote. Clicking ads may direct you to third-party sites with
              separate terms and privacy policies.
            </P>

            <H2>Disclaimer of Warranties</H2>
            <P>
              The Service is provided "as is" and "as available" without warranties of any kind, either
              express or implied. We do not guarantee that the information (vehicle stats, prices, map
              locations) is accurate, complete, or up to date, as game data is subject to change.
            </P>

            <H2>Limitation of Liability</H2>
            <P>
              To the fullest extent permitted by law, VICE.DB shall not be liable for any indirect,
              incidental, special, or consequential damages arising from your use of, or inability to
              use, the Service.
            </P>

            <H2>Changes to These Terms</H2>
            <P>
              We may update these Terms at any time. Changes are effective when posted on this page. Your
              continued use of the Service after changes constitutes acceptance of the revised Terms.
            </P>

            <H2>Contact</H2>
            <P>
              Questions about these Terms? Email{' '}
              <a href="mailto:terms@vicedb.app" className="text-cyan-neon underline hover:text-cyan-soft">terms@vicedb.app</a>.
            </P>
          </div>
        )}

        {page === 'cookie' && (
          <div>
            <P>
              This Cookie Notice explains how VICE.DB uses cookies and similar technologies in compliance
              with the EU ePrivacy Directive, GDPR, and CCPA. Cookies are small text files stored on your
              device when you visit a website.
            </P>

            <H2>Types of Cookies We Use</H2>
            <div className="mb-4 overflow-hidden rounded-lg border border-ink-600">
              <table className="w-full text-left text-sm">
                <thead className="bg-ink-850 text-[11px] uppercase tracking-wider text-ink-200">
                  <tr>
                    <th className="px-3 py-2">Cookie Type</th>
                    <th className="px-3 py-2">Purpose</th>
                    <th className="px-3 py-2">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-ink-100">
                  <tr className="border-t border-ink-700 bg-ink-800">
                    <td className="px-3 py-2 font-medium text-white">Essential (localStorage)</td>
                    <td className="px-3 py-2">Stores your map progress and "found" pins.</td>
                    <td className="px-3 py-2">Persistent (until cleared)</td>
                  </tr>
                  <tr className="border-t border-ink-700 bg-ink-850">
                    <td className="px-3 py-2 font-medium text-white">AdSense (Advertising)</td>
                    <td className="px-3 py-2">Serves and measures personalized ads via Google.</td>
                    <td className="px-3 py-2">Up to 13 months</td>
                  </tr>
                  <tr className="border-t border-ink-700 bg-ink-800">
                    <td className="px-3 py-2 font-medium text-white">Analytics</td>
                    <td className="px-3 py-2">Aggregate page-view metrics for site improvement.</td>
                    <td className="px-3 py-2">Up to 24 months</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <H2>Google AdSense Cookies</H2>
            <P>
              Google AdSense uses cookies (such as __gads and IDE) to personalize and measure
              advertising performance. These cookies allow Google and its partners to serve ads based on
              your visits to this site and other sites on the internet.
            </P>

            <H2>Managing & Disabling Cookies</H2>
            <P>You can control cookies at any time through these methods:</P>
            <UL>
              <li><strong>Browser settings:</strong> Most browsers allow you to refuse or delete cookies via the privacy settings.</li>
              <li><strong>Google Ads Settings:</strong>{' '}
                <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-neon underline hover:text-cyan-soft">
                  google.com/settings/ads
                </a>{' '}
                to opt out of personalized advertising.
              </li>
              <li><strong>Digital Advertising Alliance:</strong>{' '}
                <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" className="text-cyan-neon underline hover:text-cyan-soft">
                  aboutads.info/choices
                </a>{' '}
                for CCPA opt-out of interest-based ads.
              </li>
              <li><strong>European DAA:</strong>{' '}
                <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer" className="text-cyan-neon underline hover:text-cyan-soft">
                  youronlinechoices.eu
                </a>{' '}
                for EEA users.
              </li>
            </UL>
            <P>
              Disabling advertising cookies will not prevent ads from being shown, but they will be less
              relevant to your interests. Essential localStorage for map progress will continue to
              function.
            </P>

            <H2>Your Consent</H2>
            <P>
              By continuing to use this site, you consent to the use of cookies as described in this
              notice. If you do not agree, you may disable cookies in your browser, though some features
              may be limited.
            </P>

            <H2>Contact</H2>
            <P>
              Questions about cookies? Email{' '}
              <a href="mailto:privacy@vicedb.app" className="text-cyan-neon underline hover:text-cyan-soft">privacy@vicedb.app</a>.
            </P>
          </div>
        )}

        {page === 'contact' && (
          <div>
            <P>
              Have a question, correction, or suggestion about the GTA 6 map or vehicle database? We'd
              love to hear from you. Fill out the form below or reach us directly by email.
            </P>

            {contactSent ? (
              <div className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-6 text-center">
                <p className="font-display text-lg font-semibold text-emerald-400">Message sent!</p>
                <p className="mt-1 text-sm text-ink-100">
                  Thanks for reaching out. We'll get back to you within 1-2 business days.
                </p>
                <button
                  onClick={() => {
                    setContactSent(false);
                    setContactName('');
                    setContactEmail('');
                    setContactMessage('');
                  }}
                  className="mt-4 rounded-lg border border-ink-600 bg-ink-850 px-4 py-2 text-sm text-white transition hover:bg-ink-700"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setContactSent(true);
                }}
                className="flex flex-col gap-3"
              >
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-ink-200">
                    Name
                  </label>
                  <input
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full rounded-lg border border-ink-600 bg-ink-850 px-3 py-2 text-sm text-white outline-none focus:border-cyan-neon/60"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-ink-200">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded-lg border border-ink-600 bg-ink-850 px-3 py-2 text-sm text-white outline-none focus:border-cyan-neon/60"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-ink-200">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full resize-none rounded-lg border border-ink-600 bg-ink-850 px-3 py-2 text-sm text-white outline-none focus:border-cyan-neon/60"
                    placeholder="How can we help?"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-pink-neon to-pink-soft px-4 py-2.5 text-sm font-bold text-white transition hover:shadow-neon-pink"
                >
                  Send Message
                </button>
              </form>
            )}

            <H2>Direct Email</H2>
            <UL>
              <li>General inquiries: <a href="mailto:hello@vicedb.app" className="text-cyan-neon underline hover:text-cyan-soft">hello@vicedb.app</a></li>
              <li>Privacy & legal: <a href="mailto:privacy@vicedb.app" className="text-cyan-neon underline hover:text-cyan-soft">privacy@vicedb.app</a></li>
              <li>Data corrections: <a href="mailto:corrections@vicedb.app" className="text-cyan-neon underline hover:text-cyan-soft">corrections@vicedb.app</a></li>
            </UL>
          </div>
        )}
      </div>
    </Modal>
  );
}
