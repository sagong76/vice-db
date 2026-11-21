// Downloads the Google Sheet tabs at build time and writes them to src/data/*.json.
// The site no longer fetches the sheet in the browser: every deploy bakes the data
// into static HTML, so pages are crawlable and do not depend on a third-party proxy.
//
// If the download fails (offline, sheet not public), the last committed JSON is kept
// so the build still succeeds.
import { writeFileSync, existsSync } from 'node:fs';

const SHEET_ID = process.env.SHEET_ID || '1X-iXmEIPEgvWptnvVByzoTZk5W8DnaTMBPlx--NxsEo';
const TABS = { Vehicles: 'src/data/vehicles.json', Map_Pins: 'src/data/pins.json' };

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows;
  const keys = header.map((h) => h.trim());
  return body
    .filter((r) => r.some((v) => v.trim() !== ''))
    .map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? '').trim()])))
    .map((o) => { delete o['']; return o; });
}

let failed = 0;
for (const [tab, out] of Object.entries(TABS)) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = parseCsv(await res.text());
    if (!rows.length) throw new Error('empty sheet');
    writeFileSync(out, JSON.stringify(rows, null, 2) + '\n');
    console.log(`[fetch-data] ${tab}: ${rows.length} rows -> ${out}`);
  } catch (err) {
    failed++;
    if (!existsSync(out)) {
      console.error(`[fetch-data] ${tab} failed (${err.message}) and no cached ${out} exists`);
      process.exit(1);
    }
    console.warn(`[fetch-data] ${tab} failed (${err.message}); keeping cached ${out}`);
  }
}
if (failed) console.warn(`[fetch-data] ${failed} tab(s) used cached data`);
