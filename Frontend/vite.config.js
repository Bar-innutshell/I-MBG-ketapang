import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react() , tailwindcss()],
  server: {
    proxy: {
      '/artikel': 'http://localhost:3000',
      '/resep': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
    }
  }
})
