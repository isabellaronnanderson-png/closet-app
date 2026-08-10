import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// '/' is correct for Vercel, Netlify, or any custom domain — the site is
// served from the root of its own URL, so assets should be too.
// (Only GitHub Pages needs this changed to '/<repo-name>/', because Pages
// serves your site at username.github.io/repo-name/ instead of the root.)
export default defineConfig({
  plugins: [react()],
  base: '/',
})
