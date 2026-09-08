import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 8080;

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.json': 'application/json',
  '.xml':  'application/xml',
  '.txt':  'text/plain',
  '.pdf':  'application/pdf',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
};

// Mirrors Vercel's cleanUrls: /about -> about.html, /nl/ and /nl -> nl/index.html, /nl/over-ons -> nl/over-ons.html
function resolve(urlPath) {
  const candidates = [];
  if (urlPath.endsWith('/')) candidates.push(urlPath + 'index.html');
  else if (!path.extname(urlPath)) candidates.push(urlPath + '.html', urlPath + '/index.html');
  candidates.push(urlPath);
  for (const c of candidates) {
    const full = path.join(__dirname, c);
    if (full.startsWith(__dirname) && fs.existsSync(full) && fs.statSync(full).isFile()) return full;
  }
  return null;
}

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const filePath = resolve(urlPath);
  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  res.end(fs.readFileSync(filePath));
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
