import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Route Auth requests to the Node Auth Provider
      '/api/auth': 'http://localhost:4000',
      // Route Gateway requests to the API Gateway
      '/api/v1': 'http://localhost:3000'
    }
  }
})