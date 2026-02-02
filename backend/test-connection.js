// Test script to verify backend is responding
const http = require('http');

console.log('🧪 Testing backend connection...\n');

// Test 1: GET /
const test1 = http.get('http://127.0.0.1:3000', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('✅ TEST 1 PASSED: GET /');
    console.log('   Response:', data);
    console.log('');
    
    // Test 2: POST /api/auth/signin
    const postData = JSON.stringify({ username: 'test', password: 'test' });
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/auth/signin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ TEST 2 PASSED: POST /api/auth/signin');
        console.log('   Response:', data);
        console.log('');
        console.log('🎉 ALL TESTS PASSED - Backend is working!');
        process.exit(0);
      });
    });
    
    req.on('error', (e) => {
      console.log('❌ TEST 2 FAILED:', e.message);
      process.exit(1);
    });
    
    req.write(postData);
    req.end();
  });
});

test1.on('error', (e) => {
  console.log('❌ TEST 1 FAILED:', e.message);
  console.log('');
  console.log('🔴 Backend is NOT responding!');
  console.log('   Check:');
  console.log('   1. Is test-server.js running?');
  console.log('   2. Is port 3000 blocked by firewall?');
  process.exit(1);
});

test1.setTimeout(3000, () => {
  console.log('❌ TEST 1 TIMEOUT: Backend not responding within 3 seconds');
  test1.destroy();
  process.exit(1);
});
