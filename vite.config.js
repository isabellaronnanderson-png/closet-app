import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If you deploy to GitHub Pages at https://<user>.github.io/<repo>/,
// set base to '/<repo>/'. If you're using a custom domain or Vercel/Netlify, leave it as '/'.
export default defineConfig({
  plugins: [react()],
  base: '/as-if/',
})
