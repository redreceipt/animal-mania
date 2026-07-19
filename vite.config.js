import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  define: {
    'import.meta.env.VERCEL': JSON.stringify(process.env.VERCEL === '1'),
  },
  plugins: [react()],
})
