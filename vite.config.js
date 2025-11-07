import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Fix for simple-peer and similar packages
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
})
