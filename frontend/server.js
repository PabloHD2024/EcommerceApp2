const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname);
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const aliases = new Map([
  ['/admin.html', '/html/admin.html'],
  ['/productos.html', '/html/productos.html'],
  ['/cart.html', '/html/cart.html'],
  ['/login.html', '/html/login.html'],
]);

http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405).end();
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }
  pathname = aliases.get(pathname) || pathname;
  const requested = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (requested !== root && !requested.startsWith(`${root}${path.sep}`)) {
    res.writeHead(404).end();
    return;
  }
  fs.stat(requested, (statError, stat) => {
    if (statError || !stat.isFile()) {
      res.writeHead(404).end('Not found');
      return;
    }
    res.writeHead(200, {
      'content-type': mimeTypes[path.extname(requested).toLowerCase()] || 'application/octet-stream',
      'x-content-type-options': 'nosniff',
    });
    if (req.method === 'HEAD') res.end();
    else fs.createReadStream(requested).pipe(res);
  });
}).listen(Number(process.env.PORT || 8080), '0.0.0.0', () => {
  console.log(`Frontend listening on port ${process.env.PORT || 8080}`);
});
