import { useEffect, useState } from 'react';

const STORAGE_KEY = 'visit-rotation';

// Module-level so the position survives client-side navigation (leaving the
// page and coming back remounts the component, but not the module).
let current = null;

function readStart(count) {
  if (current !== null) return current % count;
  try {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY));
    if (Number.isInteger(stored) && stored >= 0) return stored % count;
  } catch {
    // Private mode or blocked storage — start from the top instead.
  }
  return 0;
}

/**
 * Returns an index that advances by one each time the calling component
 * mounts, wrapping at `count`. localStorage carries it across full reloads.
 *
 * @param {number} count
 * @returns {number}
 */
export function useVisitRotation(count) {
  const [index] = useState(() => (count > 0 ? readStart(count) : 0));

  useEffect(() => {
    if (count <= 0) return;
    // Derived from `index` rather than incremented, so React's double-invoked
    // effects in development land on the same value instead of skipping one.
    const next = (index + 1) % count;
    current = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Nothing to persist to; the module-level value still works this session.
    }
  }, [index, count]);

  return index;
}
