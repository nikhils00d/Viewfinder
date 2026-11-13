const { test } = require('node:test');
const assert = require('node:assert/strict');

test('API rejects cross-origin writes, malformed requests and oversized bodies with JSON errors', async () => {
  const app = require('./app');
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  try {
    let res = await fetch(base + '/auth/login', { method: 'POST', headers: { Origin: 'https://untrusted.example', 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(res.status, 403);
    assert.equal((await res.json()).message, 'Origin not allowed');
    res = await fetch(base + '/auth/login', { method: 'POST', headers: { Origin: 'http://127.0.0.1:5174', 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(res.status, 400);
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://127.0.0.1:5174');
    assert.equal(res.headers.get('cache-control'), 'no-store');
    res = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken' });
    assert.equal(res.status, 400); assert.ok((await res.json()).message);
    res = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: 'x'.repeat(34000) }) });
    assert.equal(res.status, 413);
    res = await fetch(base + '/unknown');
    assert.equal(res.status, 404); assert.equal((await res.json()).message, 'Endpoint not found');
    res = await fetch(base + '/admin/me');
    assert.equal(res.status, 401);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  } finally { await new Promise(resolve => server.close(resolve)); }
});
