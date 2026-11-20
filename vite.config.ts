import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { portfolioPages } from './plugins/portfolioPages.ts'

const page = (name: string) => fileURLToPath(new URL(name, import.meta.url))

export default defineConfig({
  // Relative asset paths, so the build works at a domain root, a subdomain or a subfolder.
  base: './',
  plugins: [react(), portfolioPages()],
  build: {
    // The 3D chunk (three.js + Rapier physics) is large by nature and loads lazily.
    chunkSizeWarningLimit: 3500,
    rolldownOptions: {
      input: {
        main: page('index.html'),
        simple: page('simple.html'),
      },
    },
  },
})
