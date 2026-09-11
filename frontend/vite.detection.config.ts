import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Dedicated Vite Server Configuration for AI Vehicle Detection Portal on Port 5174
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'rewrite-root-to-detection',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
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
    host: true
  }
})
