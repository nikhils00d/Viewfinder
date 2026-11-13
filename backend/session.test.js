const { test } = require('node:test');
const assert = require('node:assert/strict');

test('production Vercel login, authenticated me, preflight and logout cookie attributes', async () => {
  process.env.NODE_ENV = 'production';
  process.env.JWT_SECRET = 'session-regression-test-secret';
  const User = require('./models/User');
  const previous = { findOne: User.findOne, findById: User.findById };
  const user = { _id: 'test-admin', name: 'Test Admin', email: 'admin@example.com', role: 'Admin', status: 'active', matchPassword: async () => true };
  User.findOne = () => ({ select: async () => user });
  User.findById = async id => id === user._id ? user : null;
  const app = require('./app');
  assert.equal(app.get('trust proxy'), 1);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const origin = 'https://viewfinderconfluenz.vercel.app';
  const headers = { Origin: origin, 'Content-Type': 'application/json', 'X-Forwarded-Proto': 'https' };
  try {
    let res = await fetch(base + '/auth/login', { method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' } });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('access-control-allow-origin'), origin);
    assert.equal(res.headers.get('access-control-allow-credentials'), 'true');
    res = await fetch(base + '/auth/login', { method: 'POST', headers, body: JSON.stringify({ email: user.email, password: 'test-password' }) });
    assert.equal(res.status, 200);
    const cookie = res.headers.get('set-cookie');
    for (const part of ['HttpOnly', 'Secure', 'SameSite=None', 'Path=/']) assert.ok(cookie.includes(part), `${part} missing from login cookie`);
    assert.equal(res.headers.get('access-control-allow-origin'), origin);
    assert.equal(res.headers.get('access-control-allow-credentials'), 'true');
    res = await fetch(base + '/admin/me', { headers: { ...headers, Cookie: cookie.split(';')[0] } });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).email, user.email);
    assert.equal(res.headers.get('access-control-allow-origin'), origin);
    assert.equal(res.headers.get('access-control-allow-credentials'), 'true');
    res = await fetch(base + '/auth/logout', { method: 'POST', headers });
    assert.equal(res.status, 200);
    const cleared = res.headers.get('set-cookie');
    for (const part of ['HttpOnly', 'Secure', 'SameSite=None', 'Path=/', 'Expires=Thu, 01 Jan 1970']) assert.ok(cleared.includes(part), `${part} missing from logout cookie`);
    res = await fetch(base + '/auth/logout', { method: 'POST', headers: { ...headers, Origin: 'https://untrusted.example' } });
    assert.equal(res.status, 403);
    assert.equal(res.headers.get('access-control-allow-origin'), null);
    res = await fetch(base + '/auth/logout', { method: 'POST', headers: { ...headers, Origin: 'http://localhost:5173' } });
    assert.equal(res.status, 403);
    process.env.NODE_ENV = 'development';
    res = await fetch(base + '/auth/logout', { method: 'POST', headers: { ...headers, Origin: 'http://localhost:5173' } });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.ok(res.headers.get('set-cookie').includes('SameSite=Lax'));
    assert.ok(!res.headers.get('set-cookie').includes('; Secure'));
  } finally {
    Object.assign(User, previous);
    await new Promise(resolve => server.close(resolve));
  }
});
