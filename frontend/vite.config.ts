import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'rewrite-detection-portal',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === '/detection' || req.url === '/detection/') {
            req.url = '/detection.html';
          }
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        detection: 'detection.html',
      },
    },
  },
  server: {
    port: 5173,
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
