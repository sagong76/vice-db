import type { Route, Vehicle } from './types';
import { PIN_BY_ID, VEHICLES, VEHICLE_BY_ID } from './data';
import { pathFor } from './router';
import { displayName, formatPrice } from './utils';

export const SITE_URL = 'https://gta6vicedb.com';
export const SITE_NAME = 'VICE.DB';
const DEFAULT_OG = `${SITE_URL}/og-image.jpg`;

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  image: string;
  noindex?: boolean;
  jsonLd: object[];
}

function breadcrumb(items: [string, string][]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: SITE_URL + path,
    })),
  };
}

function vehicleDescription(v: Vehicle): string {
  const name = displayName(v);
  const parts = [
    `${name} in GTA 6: ${v.class} class`,
    v.real_car ? `based on the ${v.real_car}` : '',
    v.price ? `price ${formatPrice(v.price)}` : '',
    v.free_spawn.toLowerCase() === 'yes' ? 'free spawn location on the map' : '',
  ].filter(Boolean);
  return `${parts.join(', ')}. Specs, performance and comparison.`.slice(0, 158);
}

export function metaFor(route: Route): PageMeta {
  const canonical = SITE_URL + pathFor(route);
  switch (route.name) {
    case 'vehicle': {
      const v = VEHICLE_BY_ID.get(route.id)!;
      const name = displayName(v);
      const pin = v.pin_id ? PIN_BY_ID.get(v.pin_id) : undefined;
      return {
        title: `${name} - GTA 6 Price, Specs & ${pin ? 'Location' : 'Real Car'} | ${SITE_NAME}`,
        description: vehicleDescription(v),
        canonical,
        image: v.image ? SITE_URL + v.image : DEFAULT_OG,
        jsonLd: [
          breadcrumb([
            ['Home', '/'],
            ['Vehicles', '/vehicles/'],
            [name, pathFor(route)],
          ]),
        ],
      };
    }
    case 'vehicles':
      return {
        title: `GTA 6 Vehicle List: All ${VEHICLES.length} Cars, Bikes & Boats | ${SITE_NAME}`,
        description: `Every GTA 6 vehicle we track (${VEHICLES.length} so far) with class, price, real-life counterpart and free spawn locations in Leonida. Updated as new info is confirmed.`,
        canonical,
        image: DEFAULT_OG,
        jsonLd: [
          breadcrumb([
            ['Home', '/'],
            ['Vehicles', '/vehicles/'],
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: VEHICLES.map((v, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `${SITE_URL}/vehicles/${v.id}/`,
              name: displayName(v),
            })),
          },
        ],
      };
    case 'compare':
      return {
        title: `Compare GTA 6 Cars Side by Side | ${SITE_NAME}`,
        description:
          'Compare up to three GTA 6 vehicles side by side: price, top speed, acceleration, handling and free spawn availability.',
        canonical,
        image: DEFAULT_OG,
        jsonLd: [],
      };
    case 'notfound':
      return {
        title: `Page not found | ${SITE_NAME}`,
        description: 'This page does not exist.',
        canonical,
        image: DEFAULT_OG,
        noindex: true,
        jsonLd: [],
      };
    default:
      return {
        title: `GTA 6 Interactive Map & Vehicle Database | ${SITE_NAME}`,
        description:
          'Unofficial GTA 6 interactive map of Leonida and vehicle database: free car spawns, collectibles, vehicle prices, specs and real-life counterparts.',
        canonical,
        image: DEFAULT_OG,
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: SITE_URL,
          },
        ],
      };
  }
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** <head> tags for the prerendered HTML. */
export function headHtml(m: PageMeta): string {
  return [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    `<link rel="canonical" href="${m.canonical}" />`,
    m.noindex ? '<meta name="robots" content="noindex" />' : '',
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${m.canonical}" />`,
    `<meta property="og:image" content="${m.image}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    ...m.jsonLd.map(
      (j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`,
    ),
  ]
    .filter(Boolean)
    .join('\n    ');
}

/** Keeps title/description/canonical in sync during client-side navigation. */
export function applyMeta(m: PageMeta) {
  document.title = m.title;
  const set = (sel: string, attr: string, val: string) => {
    const el = document.head.querySelector(sel);
    if (el) el.setAttribute(attr, val);
  };
  set('meta[name="description"]', 'content', m.description);
  set('link[rel="canonical"]', 'href', m.canonical);
  set('meta[property="og:title"]', 'content', m.title);
  set('meta[property="og:description"]', 'content', m.description);
  set('meta[property="og:url"]', 'content', m.canonical);
  set('meta[property="og:image"]', 'content', m.image);
}
