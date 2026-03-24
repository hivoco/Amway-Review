import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: {
    port: 8827,
    host: '0.0.0.0',
    allowedHosts: ['node.hivoco.com'],
  },
  server: {
    port: 8827,
  },
})
