import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// '/' is correct for Vercel, Netlify, or any custom domain.
// Only change this to '/<repo-name>/' if deploying specifically to GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: '/',
})
