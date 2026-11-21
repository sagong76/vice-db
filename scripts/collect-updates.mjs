// Daily GTA 6 info collector. Runs in GitHub Actions (.github/workflows/daily-updates.yml).
//
// Compares our database (src/data/vehicles.json, refreshed from the Google Sheet by
// fetch-data.mjs) against community wikis and news, and writes a Markdown report to
// report.md. The workflow posts it as a GitHub issue, so the daily review is:
// open the issue -> update the sheet -> done.
//
// Only titles, links and dates are read from the sources. Nothing is copied into the site.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const UA = 'VICE.DB-update-bot/1.0 (+https://gta6vicedb.com)';
const STATE_FILE = process.env.STATE_FILE || '.update-state/seen.json';
const DAY = 24 * 3600 * 1000;
const now = Date.now();

const WIKIS = [
  { name: 'GTA Wiki (gta.wiki)', base: 'https://gta.wiki', apis: ['/api.php', '/w/api.php'], page: '/w/' },
  { name: 'GTA Wiki (Fandom)', base: 'https://gta.fandom.com', apis: ['/api.php'], page: '/wiki/' },
];
const CATEGORIES = [
  'Category:Vehicles in GTA VI',
  'Category:Vehicles in Grand Theft Auto VI',
  'Category:Grand Theft Auto VI vehicles',
  'Category:GTA VI vehicles',
];

const status = [];
const log = (s) => console.log(`[collect] ${s}`);

async function get(url, as = 'json') {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return as === 'json' ? res.json() : res.text();
}

// ---------- our data ----------
const vehicles = JSON.parse(readFileSync('src/data/vehicles.json', 'utf8'));
const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/['’"]/g, '')
    .replace(/[^a-z0-9]+/g, '');
function modelName(v) {
  const name = String(v.name ?? '');
  const m = String(v.manufacturer ?? '');
  return m && name.toLowerCase().startsWith(m.toLowerCase()) ? name.slice(m.length).trim() : name;
}
const ours = vehicles.map((v) => ({ id: v.id, name: v.name, key: norm(modelName(v)), full: norm(v.name) }));
const ourKeys = new Set(ours.flatMap((o) => [o.key, o.full]));

// ---------- state ----------
const state = existsSync(STATE_FILE)
  ? JSON.parse(readFileSync(STATE_FILE, 'utf8'))
  : { wikiTitles: [], news: [], firstRun: true };
const seenWiki = new Set(state.wikiTitles);
const seenNews = new Set(state.news);

// ---------- wikis ----------
async function wikiCategory(wiki) {
  for (const api of wiki.apis) {
    for (const cat of CATEGORIES) {
      const pages = [];
      let cont = '';
      try {
        do {
          const url =
            `${wiki.base}${api}?action=query&format=json&generator=categorymembers&gcmnamespace=0&gcmlimit=500` +
            `&gcmtitle=${encodeURIComponent(cat)}&prop=info${cont}`;
          const j = await get(url);
          pages.push(...Object.values(j.query?.pages ?? {}));
          cont = j.continue?.gcmcontinue ? `&gcmcontinue=${encodeURIComponent(j.continue.gcmcontinue)}` : '';
        } while (cont);
      } catch (e) {
        if (/HTTP 404/.test(e.message)) break; // wrong api path, try the next one
        log(`${wiki.name} ${api} ${cat}: ${e.message}`);
        continue;
      }
      if (pages.length) return { api, cat, pages };
    }
  }
  return null;
}

const wikiTitles = new Map(); // norm -> {title, url, wiki, touched}
for (const wiki of WIKIS) {
  try {
    const r = await wikiCategory(wiki);
    if (!r) {
      status.push(`⚠️ ${wiki.name}: no GTA VI vehicle category found`);
      continue;
    }
    status.push(`✅ ${wiki.name}: ${r.pages.length} pages in "${r.cat}"`);
    for (const p of r.pages) {
      const k = norm(p.title);
      if (!k) continue;
      const entry = {
        title: p.title,
        url: wiki.base + wiki.page + encodeURIComponent(p.title.replace(/ /g, '_')),
        wiki: wiki.name,
        api: wiki.base + r.api,
        touched: Date.parse(p.touched ?? '') || 0,
      };
      const prev = wikiTitles.get(k);
      if (!prev || entry.touched > prev.touched) wikiTitles.set(k, entry);
    }
  } catch (e) {
    status.push(`❌ ${wiki.name}: ${e.message}`);
  }
}

// match a wiki title against our names: exact model, or one contains the other
function matchesOurs(k) {
  if (ourKeys.has(k)) return true;
  return ours.some((o) => o.key.length > 3 && (k.includes(o.key) || o.key.includes(k)));
}

const wikiList = [...wikiTitles.entries()];
const missingInDb = wikiList.filter(([k]) => !matchesOurs(k)).map(([, e]) => e);
const newMissing = missingInDb.filter((e) => !seenWiki.has(e.title)).sort((a, b) => b.touched - a.touched);
// "touched" also changes on cache purges, so check the real last-edit time of our vehicles' pages.
async function lastEdits(entries) {
  const out = [];
  const byApi = Map.groupBy(entries, (e) => e.api);
  for (const [api, list] of byApi) {
    for (let i = 0; i < list.length; i += 50) {
      const chunk = list.slice(i, i + 50);
      try {
        const j = await get(
          `${api}?action=query&format=json&prop=revisions&rvprop=timestamp|comment|user|flags&titles=` +
            encodeURIComponent(chunk.map((e) => e.title).join('|')),
        );
        for (const p of Object.values(j.query?.pages ?? {})) {
          const rev = p.revisions?.[0];
          const e = chunk.find((x) => x.title === p.title);
          // Skip minor edits and housekeeping (formatting, typos, links, categories, images).
          const trivial = 'minor' in (rev ?? {}) || /format|typo|spelling|grammar|link|categor|image|gallery|cleanup|revert|undo/i.test(rev?.comment ?? '');
          if (rev && e && !trivial && now - Date.parse(rev.timestamp) < 2 * DAY) {
            out.push({ ...e, note: rev.comment ? `"${rev.comment.slice(0, 80)}"` : '' });
          }
        }
      } catch (err) {
        log(`revisions ${api}: ${err.message}`);
      }
    }
  }
  return out;
}
const recentlyEdited = await lastEdits(wikiList.filter(([k]) => matchesOurs(k)).map(([, e]) => e));
const notOnWiki = wikiList.length
  ? ours.filter((o) => ![...wikiTitles.keys()].some((k) => k === o.key || k === o.full || (o.key.length > 3 && (k.includes(o.key) || o.key.includes(k)))))
  : [];

// ---------- News (Google News RSS: covers Rockstar Newswire and gaming sites) ----------
// rockstargames.com is rendered by JavaScript and Reddit blocks GitHub's servers,
// so news comes from Google News search feeds instead.
const NEWS_QUERIES = [
  'GTA 6 vehicles',
  'GTA 6 cars',
  'GTA 6 free car location',
  'Rockstar Newswire GTA VI',
];
const news = [];
for (const q of NEWS_QUERIES) {
  try {
    const xml = await get(
      `https://news.google.com/rss/search?q=${encodeURIComponent(q + ' when:2d')}&hl=en-US&gl=US&ceid=US:en`,
      'text',
    );
    let n = 0;
    for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
      const pick = (tag) =>
        (m[1].match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1] ?? '')
          .replace(/<!\[CDATA\[|\]\]>/g, '')
          .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .trim();
      const title = pick('title');
      const url = pick('link');
      const source = pick('source');
      if (url && !news.some((x) => x.title === title)) {
        news.push({ title, url, source });
        n++;
      }
    }
    status.push(`✅ Google News "${q}": ${n} items`);
  } catch (e) {
    status.push(`❌ Google News "${q}": ${e.message}`);
  }
}
const newNews = news.filter((x) => !seenNews.has(x.title) && /gta|grand theft auto|rockstar/i.test(x.title)).slice(0, 25);

// ---------- report ----------
const today = new Date().toISOString().slice(0, 10);
const md = [];
const li = (e) => `- [ ] [${e.title}](${e.url})`;
md.push(`Daily GTA 6 update check for **${today}**. Tick items once handled in the Google Sheet.\n`);

md.push(`## 🆕 Vehicles on wikis but not in our database (${newMissing.length} new)`);
md.push(newMissing.length ? newMissing.slice(0, 60).map((e) => `${li(e)} _(${e.wiki})_`).join('\n') : '_Nothing new._');
if (newMissing.length > 60) md.push(`\n…and ${newMissing.length - 60} more.`);

md.push(`\n## ✏️ Wiki pages of our vehicles edited in the last 48h (${recentlyEdited.length})`);
md.push('Check these for price, spec or location changes.\n');
md.push(recentlyEdited.length ? recentlyEdited.map((e) => `${li(e)} ${e.note ? `_${e.note}_` : ''}`).join('\n') : '_None._');

md.push(`\n## 📰 News from the last 2 days (${newNews.length} new)`);
md.push(newNews.length ? newNews.map((x) => `${li(x)}${x.source ? ` _(${x.source})_` : ''}`).join('\n') : '_No new GTA vehicle news._');

if (notOnWiki.length) {
  md.push(`\n<details><summary>❓ In our database but not found on any wiki (${notOnWiki.length}): verify or remove</summary>\n`);
  md.push(notOnWiki.map((o) => `- [${o.name}](https://gta6vicedb.com/vehicles/${o.id}/)`).join('\n'));
  md.push('\n</details>');
}
if (state.firstRun && missingInDb.length) {
  md.push('\n> First run: every wiki vehicle missing from the database is listed above. From tomorrow only new ones appear.');
}

md.push(`\n<details><summary>Source status</summary>\n\n${status.join('\n\n')}\n</details>`);
writeFileSync('report.md', md.join('\n') + '\n');

const total = newMissing.length + recentlyEdited.length + newNews.length;
writeFileSync(process.env.GITHUB_OUTPUT || '/dev/null', `items=${total}\n`, { flag: 'a' });

// ---------- save state ----------
const nextState = {
  firstRun: false,
  wikiTitles: [...new Set([...state.wikiTitles, ...missingInDb.map((e) => e.title)])],
  news: [...new Set([...state.news, ...news.map((n) => n.title)])].slice(-1000),
};
const dir = STATE_FILE.split('/').slice(0, -1).join('/');
if (dir) (await import('node:fs')).mkdirSync(dir, { recursive: true });
writeFileSync(STATE_FILE, JSON.stringify(nextState));

log(status.join(' | '));
log(`report: ${total} actionable item(s)`);
