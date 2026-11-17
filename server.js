/**
 * DAINTY STUDS & CHAINS - Hostinger Node.js 22 Production Server
 * Entry point for Hostinger Node.js deployment (daintystudsandchains.com)
 */

import { createServer } from 'node:http';
import { existsSync, statSync, createReadStream } from 'node:fs';
import { resolve, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApiRequest } from './api/handler.js';

// Auto-load .env in Node.js 22
if (typeof process.loadEnvFile === 'function') {
  try { process.loadEnvFile('.env'); } catch {}
  try { process.loadEnvFile(resolve(process.cwd(), '.env')); } catch {}
  try { process.loadEnvFile('/home/u111258626/domains/daintystudsandchains.com/dainty_data/.env'); } catch {}
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const DIST_DIR = resolve(__dirname, 'dist');
const PORT = Number(process.env.PORT || 3000);

// Comprehensive MIME type map for frontend assets
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.mjs': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=UTF-8'
};

const server = createServer(async (req, res) => {
  // Global CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const host = req.headers.host || 'localhost';
  const url = new URL(req.url, `http://${host}`);
  const pathname = url.pathname;

  // 1. Direct all /api/* requests to the API handler
  if (pathname.startsWith('/api')) {
    try {
      await handleApiRequest(req, res);
    } catch (err) {
      console.error('[API Error]:', err.message);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
      }
    }
    return;
  }

  // 2. Serve static built assets from dist/
  const decodedPath = decodeURIComponent(pathname);
  const filePath = join(DIST_DIR, decodedPath);

  try {
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const ext = extname(filePath).toLowerCase();
      const mime = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable'
      });
      createReadStream(filePath).pipe(res);
      return;
    }
  } catch {
    // Continue to SPA fallback
  }

  // 3. SPA Route Fallback -> dist/index.html (e.g. /admin, /shop, /checkout)
  const indexPath = join(DIST_DIR, 'index.html');
  if (existsSync(indexPath)) {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'no-cache'
    });
    createReadStream(indexPath).pipe(res);
    return;
  }

  // 4. Initial boot fallback
  res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
  res.end('<!DOCTYPE html><html><head><title>DAINTY STUDS & CHAINS</title></head><body><h1>DAINTY STUDS & CHAINS</h1><p>Online boutique server is active.</p></body></html>');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[DAINTY HQ] Hostinger Node.js 22 server active on http://0.0.0.0:${PORT}`);
});
