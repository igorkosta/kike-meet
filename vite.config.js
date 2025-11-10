import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Fix for simple-peer and similar packages
export default defineConfig({
  // base: "/kike-meet/",
  plugins: [
    react(),
    tailwindcss()
  ],
  define: {
    global: 'window',
  },
})
