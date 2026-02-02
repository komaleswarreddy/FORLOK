// MINIMAL TEST SERVER - No dependencies, no database, no auth
// This proves if the backend can respond at all

const http = require('http');

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Log request
  console.log(`🔥 ${req.method} ${req.url} from ${req.socket.remoteAddress}`);

  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('BACKEND ALIVE');
    return;
  }

  if (req.url === '/api/auth/signin' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      console.log('🔥 SIGNIN HIT', body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Test server responding' }));
    });
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TEST SERVER running on http://0.0.0.0:${PORT}`);
  console.log(`   Test with: curl http://127.0.0.1:${PORT}`);
  console.log(`   Or: curl http://localhost:${PORT}`);
});
