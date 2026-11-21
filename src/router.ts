import { useCallback, useEffect, useState } from 'react';
import type { Route } from './types';
import { VEHICLE_BY_ID } from './data';

// Every view has its own URL so that search engines can index it and the
// prerender step (scripts/prerender.mjs) can write one static HTML file per page.

export function parsePath(pathname: string): Route {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/' || path === '/map') return { name: 'map' };
  if (path === '/vehicles') return { name: 'vehicles' };
  if (path === '/compare') return { name: 'compare' };
  const m = path.match(/^\/vehicles\/([a-z0-9-]+)$/);
  if (m && VEHICLE_BY_ID.has(m[1])) return { name: 'vehicle', id: m[1] };
  return { name: 'notfound' };
}

export function pathFor(route: Route): string {
  switch (route.name) {
    case 'map':
      return '/';
    case 'vehicles':
      return '/vehicles/';
    case 'compare':
      return '/compare/';
    case 'vehicle':
      return `/vehicles/${route.id}/`;
    default:
      return '/404/';
  }
}

export const vehiclePath = (id: string) => `/vehicles/${id}/`;

/** Lets plain <a href> links navigate client-side (left click without modifiers). */
export function isPlainClick(e: React.MouseEvent): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}

export function useRouter(initialPath: string) {
  const [route, setRoute] = useState<Route>(() => parsePath(initialPath));

  useEffect(() => {
    const onPop = () => setRoute(parsePath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((path: string) => {
    if (path !== window.location.pathname) window.history.pushState(null, '', path);
    setRoute(parsePath(path));
    window.scrollTo(0, 0);
  }, []);

  return { route, navigate };
}
