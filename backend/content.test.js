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
  const originals = [User.findById, Event.find, Event.create, Photowalk.findOneAndUpdate, Event.findByIdAndUpdate, Event.findByIdAndDelete];
  let role = 'Admin';
  User.findById = async () => ({ role, status: 'active' });
  const rows = [];
  Event.create = async data => { const row = { ...data, _id: String(rows.length + 1) }; rows.push(row); return row; };
  Event.findByIdAndUpdate = async (id, data) => { const i = rows.findIndex(e => e._id === id); if (i < 0) return null; rows[i] = { ...data, _id: id }; return rows[i]; };
  Event.findByIdAndDelete = async id => { const i = rows.findIndex(e => e._id === id); return i < 0 ? null : rows.splice(i, 1)[0]; };
  Event.find = (filter = {}) => ({ sort: async () => rows.filter(e => (!filter.published || e.published) && (filter.section === 'chitrakala' ? e.section === 'chitrakala' : filter.section ? e.section !== 'chitrakala' : true)) });
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
    assert.equal((await request('/admin/events/2', { ...event, published: false }, true, 'PUT')).status, 200);
    assert.equal((await (await fetch(base + '/events')).json()).length, 0);
    assert.equal((await request('/admin/events/404', event, true, 'PUT')).status, 404);
    assert.equal((await request('/admin/events/2', undefined, false, 'DELETE')).status, 401);
    assert.equal((await request('/admin/events/2', undefined, true, 'DELETE')).status, 200);
    assert.equal((await request('/admin/events/2', undefined, true, 'DELETE')).status, 404);
    assert.equal((await request('/admin/events', { ...event, section: 'chitrakala', published: true })).status, 201);
    assert.equal((await (await fetch(base + '/collections')).json()).length, 1);
    assert.equal((await (await fetch(base + '/events')).json()).length, 0);
    const walk = { title: 'Latest walk', url: 'https://example.com/photo.jpg', link: 'https://instagram.com/p/example' };
    assert.equal((await request('/admin/photowalks/8', walk, true, 'PUT')).status, 400);
    assert.equal((await request('/admin/photowalks/0', { ...walk, link: 'javascript:alert(1)' }, true, 'PUT')).status, 400);
    assert.equal((await request('/admin/photowalks/0', walk, true, 'PUT')).status, 200);
  } finally {
    [User.findById, Event.find, Event.create, Photowalk.findOneAndUpdate, Event.findByIdAndUpdate, Event.findByIdAndDelete] = originals;
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
