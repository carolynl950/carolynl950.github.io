import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

// GitHub Pages serves this repo at the domain root (user site), so base is '/'.
// Pages has no SPA rewrite, so deep links like /writing/some-post would 404.
// Copying index.html to 404.html makes Pages serve the app for unknown paths.
const spaFallback = {
  name: 'spa-fallback-404',
  closeBundle() {
    const dist = resolve(__dirname, 'dist');
    copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'));
  },
};

export default defineConfig({
  base: '/',
  plugins: [react(), spaFallback],
});
