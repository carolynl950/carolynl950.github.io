import { useEffect } from 'react';
import { site } from '../content/site.js';

// There's no server rendering here, so each route sets its own document title.
export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${site.name}` : site.name;
  }, [title]);
}
