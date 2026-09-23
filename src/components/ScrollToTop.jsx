import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Client-side navigation keeps the old scroll position, which lands you
// mid-page on a post you just opened. Reset on every path change.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
