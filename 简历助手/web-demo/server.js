const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 3007;
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8' };
const server = http.createServer((req, res) => {
  let fp = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not Found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'text/plain' });
    res.end(data);
  });
});
server.listen(PORT, () => console.log('简历助手 Web 演示版: http://localhost:' + PORT));
