// Writes a static HTML file for every route (home, list, compare, each vehicle)
// plus sitemap.xml, using the SSR bundle built by `vite build --ssr`.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const SITE = 'https://gta6vicedb.com';
const template = readFileSync('dist/index.html', 'utf8');
const { render, VEHICLES } = await import(pathToFileURL('dist-server/entry-server.js').href);

const today = new Date().toISOString().slice(0, 10);
const routes = ['/', '/vehicles/', '/compare/', ...VEHICLES.map((v) => `/vehicles/${v.id}/`)];

function write(route, file) {
  const { html, head } = render(route);
  const page = template.replace('<!--head-->', head).replace('<!--app-->', html);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page);
}

for (const route of routes) write(route, join('dist', route, 'index.html'));
write('/404/', 'dist/404.html');

const lastmod = (route) => {
  const v = VEHICLES.find((x) => route === `/vehicles/${x.id}/`);
  return /^\d{4}-\d{2}-\d{2}$/.test(v?.updated ?? '') ? v.updated : today;
};
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) => `  <url><loc>${SITE}${r}</loc><lastmod>${lastmod(r)}</lastmod></url>`).join('\n')}
</urlset>
`;
writeFileSync('dist/sitemap.xml', sitemap);
rmSync('dist-server', { recursive: true, force: true });
console.log(`[prerender] ${routes.length} pages + 404 + sitemap.xml`);
