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
        const light = `/favicon.svg?v=${FAVICON_CACHE_KEY}`
        const dark = `/favicon-dark.svg?v=${FAVICON_CACHE_KEY}`
        return html
          .replaceAll('__FAVICON_LIGHT_HREF__', light)
          .replaceAll('__FAVICON_DARK_HREF__', dark)
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
