import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function gabaritoLocal() {
  return {
    name: 'gabarito-local',
    configureServer(server) {
      server.middlewares.use('/gabarito-local.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(readFileSync(resolve('docs/gabarito.json')));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), gabaritoLocal()],
  server: {
    port: 5173,
    host: true,
  },
});
