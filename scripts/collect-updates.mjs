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
const REDDIT = ['GTA6', 'GTA'];
const KEYWORDS = /\b(car|cars|vehicle|vehicles|spawn|location|price|garage|dealer|bike|boat|plane|heli|supercar|customi[sz]e|map)\b/i;

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
  : { wikiTitles: [], news: [], reddit: [], firstRun: true };
const seenWiki = new Set(state.wikiTitles);
const seenNews = new Set(state.news);
const seenReddit = new Set(state.reddit);

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
const newMissing = missingInDb.filter((e) => !seenWiki.has(e.title));
const recentlyEdited = wikiList
  .filter(([k, e]) => matchesOurs(k) && now - e.touched < 2 * DAY)
  .map(([, e]) => e);
const notOnWiki = wikiList.length
  ? ours.filter((o) => ![...wikiTitles.keys()].some((k) => k === o.key || k === o.full || (o.key.length > 3 && (k.includes(o.key) || o.key.includes(k)))))
  : [];

// ---------- Rockstar Newswire ----------
const news = [];
try {
  const html = await get('https://www.rockstargames.com/newswire', 'text');
  const re = /href="(\/newswire\/article\/[^"#?]+)"[^>]*>([\s\S]{0,400}?)<\/a>/g;
  for (const m of html.matchAll(re)) {
    const url = 'https://www.rockstargames.com' + m[1];
    const title = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || m[1].split('/').pop().replace(/-/g, ' ');
    if (!news.some((n) => n.url === url)) news.push({ url, title });
  }
  status.push(news.length ? `✅ Rockstar Newswire: ${news.length} articles` : '⚠️ Rockstar Newswire: page loaded but no article links found');
} catch (e) {
  status.push(`❌ Rockstar Newswire: ${e.message}`);
}
const newNews = news.filter((n) => !seenNews.has(n.url) && /gta|grand theft auto|vi\b/i.test(n.title + n.url));

// ---------- Reddit ----------
const posts = [];
for (const sub of REDDIT) {
  try {
    const xml = await get(`https://www.reddit.com/r/${sub}/top.rss?t=day&limit=50`, 'text');
    for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
      const title = (m[1].match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '')
        .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      const url = m[1].match(/<link href="([^"]+)"/)?.[1] ?? '';
      if (url && KEYWORDS.test(title)) posts.push({ sub, title, url });
    }
    status.push(`✅ Reddit r/${sub}: ok`);
  } catch (e) {
    status.push(`❌ Reddit r/${sub}: ${e.message}`);
  }
}
const newPosts = posts.filter((p) => !seenReddit.has(p.url)).slice(0, 15);

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
md.push(recentlyEdited.length ? recentlyEdited.map(li).join('\n') : '_None._');

md.push(`\n## 📰 Rockstar Newswire (${newNews.length} new)`);
md.push(newNews.length ? newNews.map(li).join('\n') : '_No new GTA articles._');

md.push(`\n## 💬 Reddit top posts about vehicles/locations (${newPosts.length})`);
md.push(newPosts.length ? newPosts.map((p) => `- [ ] [${p.title}](${p.url}) _(r/${p.sub})_`).join('\n') : '_None._');

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

const total = newMissing.length + recentlyEdited.length + newNews.length + newPosts.length;
writeFileSync(process.env.GITHUB_OUTPUT || '/dev/null', `items=${total}\n`, { flag: 'a' });

// ---------- save state ----------
const nextState = {
  firstRun: false,
  wikiTitles: [...new Set([...state.wikiTitles, ...missingInDb.map((e) => e.title)])],
  news: [...new Set([...state.news, ...news.map((n) => n.url)])].slice(-500),
  reddit: [...new Set([...state.reddit, ...posts.map((p) => p.url)])].slice(-2000),
};
const dir = STATE_FILE.split('/').slice(0, -1).join('/');
if (dir) (await import('node:fs')).mkdirSync(dir, { recursive: true });
writeFileSync(STATE_FILE, JSON.stringify(nextState));

log(status.join(' | '));
log(`report: ${total} actionable item(s)`);
