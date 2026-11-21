import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { VEHICLES } from './data';
import { parsePath } from './router';
import { headHtml, metaFor } from './seo';

export { VEHICLES };

/** Used by scripts/prerender.mjs to write one static HTML file per route. */
export function render(path: string) {
  const html = renderToString(
    <StrictMode>
      <App initialPath={path} />
    </StrictMode>,
  );
  return { html, head: headHtml(metaFor(parsePath(path))) };
}
