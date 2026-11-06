const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
const Photowalk = require('./models/Photowalk');

test('content API permissions, validation, publication and fixed photo walk slots', async () => {
  process.env.JWT_SECRET = 'test-secret-only';
  const app = express();
  app.use(express.json(), cookieParser());
  app.use('/api', require('./routes/contentRoutes'));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const cookie = `jwt=${jwt.sign({ userId: 'admin' }, process.env.JWT_SECRET)}`;
  const originals = [User.findById, Event.find, Event.create, Photowalk.findOneAndUpdate];
  let role = 'Admin';
  User.findById = async () => ({ role, status: 'active' });
  const rows = [];
  Event.create = async data => { rows.push(data); return data; };
  Event.find = filter => ({ sort: async () => rows.filter(e => !filter.published || e.published) });
  Photowalk.findOneAndUpdate = async (filter, data) => data;
  const request = (path, data, auth = true, method = 'POST') => fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(auth ? { cookie } : {}) }, body: data === undefined ? undefined : JSON.stringify(data) });
  try {
    const event = { title: 'Campus festival', date: '2026-11-06', driveUrl: 'https://drive.google.com/drive/folders/example' };
    assert.equal((await request('/admin/events', event, false)).status, 401);
    role = 'Guest';
    assert.equal((await request('/admin/events', event)).status, 403);
    role = 'Admin';
    assert.equal((await request('/admin/events', { ...event, driveUrl: 'javascript:alert(1)' })).status, 400);
    assert.equal((await request('/admin/events', event)).status, 201);
    assert.deepEqual(await (await fetch(base + '/events')).json(), []);
    assert.equal((await request('/admin/events', { ...event, published: true, pinned: true })).status, 201);
    assert.equal((await (await fetch(base + '/events')).json()).length, 1);
    const walk = { title: 'Latest walk', url: 'https://example.com/photo.jpg', link: 'https://instagram.com/p/example' };
    assert.equal((await request('/admin/photowalks/8', walk, true, 'PUT')).status, 400);
    assert.equal((await request('/admin/photowalks/0', { ...walk, link: 'javascript:alert(1)' }, true, 'PUT')).status, 400);
    assert.equal((await request('/admin/photowalks/0', walk, true, 'PUT')).status, 200);
  } finally {
    [User.findById, Event.find, Event.create, Photowalk.findOneAndUpdate] = originals;
    await new Promise(resolve => server.close(resolve));
  }
});

test('password hook hashes new passwords and preserves existing hashes', async () => {
  const user = new User({ name: 'Test', email: 'test@example.com', phone: '123', password: 'a-long-test-password' });
  await User.schema.s.hooks.execPre('save', user, []);
  assert.equal(await bcrypt.compare('a-long-test-password', user.password), true);
  const hash = user.password;
  user.$__reset();
  await User.schema.s.hooks.execPre('save', user, []);
  assert.equal(user.password, hash);
});

test('login refuses pending and suspended administrators', async () => {
  const { loginUser } = require('./controllers/authController');
  const original = User.findOne;
  try {
    for (const status of ['pending', 'suspended']) {
      User.findOne = () => ({ select: async () => ({ role: 'Admin', status, matchPassword: async () => true }) });
      let code;
      const res = { status(c) { code = c; return this; }, json() {}, cookie() { throw new Error('Must not issue a cookie'); } };
      await loginUser({ body: { email: 'test@example.com', password: 'password' } }, res);
      assert.equal(code, 403);
    }
  } finally { User.findOne = original; }
});
