import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Dedicated Vite Server Configuration for AI Vehicle Detection Portal on Port 5174
export default defineConfig({
  cacheDir: 'node_modules/.vite-detection',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'rewrite-root-to-detection',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === '/' || req.url === '/index.html') {
            req.url = '/detection.html';
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 5174,
    host: '0.0.0.0',
    cors: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/static': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
      },
    }
  }
})
