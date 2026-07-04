import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/football': {
        target: 'https://api.football-data.org/v4',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/football/, ''),
        headers: {
          'X-Auth-Token': process.env.VITE_API_KEY ?? '',
        },
      },
    },
  },
})
