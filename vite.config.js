import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` produces a normal, code-split site for hosting (Vercel, Netlify, GitHub Pages).
// `SINGLE=1 npm run build` inlines everything into one index.html (handy for sharing a single file).
export default defineConfig({
  base: './',
  plugins: [react(), ...(process.env.SINGLE ? [viteSingleFile()] : [])],
})
