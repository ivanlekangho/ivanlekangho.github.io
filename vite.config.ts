import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // The repo is ivanlekangho.github.io, a GitHub Pages *user* site, so it is
  // served from the domain root. If this were ever moved to a project repo
  // (github.com/ivanlekangho/some-repo) this must become '/some-repo/'.
  base: '/',
  plugins: [react()],
  build: { outDir: 'dist', assetsDir: 'assets', sourcemap: false },
})
