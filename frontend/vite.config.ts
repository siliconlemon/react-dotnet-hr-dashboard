import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { FAVICON_CACHE_KEY } from './src/constants/faviconUrl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'inject-favicon-href',
      transformIndexHtml(html) {
        return html.replaceAll(
          '__FAVICON_HREF__',
          `/favicon.svg?v=${FAVICON_CACHE_KEY}`,
        )
      },
    },
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5228',
        changeOrigin: true,
      },
    },
  },
})
