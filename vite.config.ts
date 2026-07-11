/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative base so the same build works both on GitHub Pages
  // (served from the /filt/ subpath) and inside the Capacitor
  // Android WebView (file://). No client-side router, so this is safe.
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
});
