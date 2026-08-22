const app = require('../app');
const http = require('http');

let server;
const PORT = 3999;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

const seed = require('../seed/seed');

async function runTests() {
  console.log('Running CineData API Automated Test Suite...\n');
  await seed();

  server = app.listen(PORT);
  // Wait a bit for initialization
  await new Promise(r => setTimeout(r, 500));

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Authentication Tests
  console.log('--- 1. Authentication Tests ---');
  let testUserJwt = '';

  await test('Register new user', async () => {
    const res = await request('POST', '/api/auth/register', {}, {
      name: 'Test Runner User',
      email: `test_${Date.now()}@cinedata.io`,
      password: 'password123'
    });
    if (res.status !== 201 || !res.body.success) throw new Error(`Expected status 201, got ${res.status}`);
    testUserJwt = res.body.data.token;
  });

  await test('Login with demo user credentials', async () => {
    const res = await request('POST', '/api/auth/login', {}, {
      email: 'izaya@gmail.com',
      password: '123456'
    });
    if (res.status !== 200 || !res.body.success) throw new Error(`Login failed with status ${res.status}`);
  });

  await test('Login with wrong password should return 401', async () => {
    const res = await request('POST', '/api/auth/login', {}, {
      email: 'izaya@gmail.com',
      password: 'wrong_password_999'
    });
    if (res.status !== 401 || res.body.success) throw new Error(`Expected status 401, got ${res.status}`);
  });

  await test('GET /api/auth/me with valid JWT token', async () => {
    const res = await request('GET', '/api/auth/me', { 'Authorization': `Bearer ${testUserJwt}` });
    if (res.status !== 200 || !res.body.data.user) throw new Error('Failed to fetch profile with JWT');
  });

  // 2. API Key Management Tests
  console.log('\n--- 2. API Key Management Tests ---');
  let createdApiKeySecret = '';
  let createdKeyId = null;

  await test('Create API Key via POST /api/keys', async () => {
    const res = await request('POST', '/api/keys', { 'Authorization': `Bearer ${testUserJwt}` }, {
      name: 'Automated Test Key',
      environment: 'live'
    });
    if (res.status !== 201 || !res.body.data.api_key) throw new Error('Failed to create API key');
    createdApiKeySecret = res.body.data.api_key;
    createdKeyId = res.body.data.id;
  });

  await test('List API Keys via GET /api/keys', async () => {
    const res = await request('GET', '/api/keys', { 'Authorization': `Bearer ${testUserJwt}` });
    if (res.status !== 200 || !Array.isArray(res.body.data)) throw new Error('Failed to list API keys');
  });

  // 3. Public Movie API Tests
  console.log('\n--- 3. Public Movie API Tests ---');

  await test('Public API request without x-api-key header should return 401 MISSING_API_KEY', async () => {
    const res = await request('GET', '/api/v1/movies');
    if (res.status !== 401 || res.body.error?.code !== 'MISSING_API_KEY') throw new Error('Expected 401 MISSING_API_KEY');
  });

  await test('Public API request with invalid x-api-key should return 401 INVALID_API_KEY', async () => {
    const res = await request('GET', '/api/v1/movies', { 'x-api-key': 'cd_live_invalid_key_12345' });
    if (res.status !== 401 || res.body.error?.code !== 'INVALID_API_KEY') throw new Error('Expected 401 INVALID_API_KEY');
  });

  await test('GET /api/v1/movies with valid API Key should return movies list & metadata', async () => {
    const res = await request('GET', '/api/v1/movies?limit=5', { 'x-api-key': createdApiKeySecret });
    if (res.status !== 200 || !res.body.success || !res.body.meta) throw new Error('Failed to fetch movies with API key');
    if (res.body.data.length === 0) throw new Error('Movies data empty');
  });

  await test('GET /api/v1/movies with search filter (?search=inception)', async () => {
    const res = await request('GET', '/api/v1/movies?search=inception', { 'x-api-key': createdApiKeySecret });
    if (res.status !== 200 || res.body.data.length === 0) throw new Error('Search failed to return results');
  });

  await test('GET /api/v1/movies/:id returns detailed movie info', async () => {
    const res = await request('GET', '/api/v1/movies/1', { 'x-api-key': createdApiKeySecret });
    if (res.status !== 200 || !res.body.data.title) throw new Error('Failed to get movie by ID');
  });

  await test('GET /api/v1/genres returns genre list', async () => {
    const res = await request('GET', '/api/v1/genres', { 'x-api-key': createdApiKeySecret });
    if (res.status !== 200 || res.body.data.length < 15) throw new Error('Genres list invalid');
  });

  await test('Revoke API key and verify 403 INACTIVE_API_KEY on request', async () => {
    await request('PATCH', `/api/keys/${createdKeyId}/revoke`, { 'Authorization': `Bearer ${testUserJwt}` });
    const res = await request('GET', '/api/v1/movies', { 'x-api-key': createdApiKeySecret });
    if (res.status !== 403 || res.body.error?.code !== 'INACTIVE_API_KEY') throw new Error('Expected 403 INACTIVE_API_KEY');
  });

  console.log(`\n=======================================================`);
  console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`=======================================================\n`);

  server.close();
  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runTests().catch(err => {
  console.error('Test runner execution error:', err);
  if (server) server.close();
  process.exit(1);
});
