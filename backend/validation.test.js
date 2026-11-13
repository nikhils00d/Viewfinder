const { test } = require('node:test');
const assert = require('node:assert/strict');
const { eventData, walkData, httpsUrl } = require('./utils/validateContent');

const event = { title: '  Campus festival  ', date: '2026-11-06', driveUrl: 'https://drive.google.com/drive/folders/example' };
test('event validation rejects impossible dates, invalid settings and oversized input', () => {
  for (const date of ['2026-02-30', '2025-02-29', '2026-13-01', 'tomorrow', null]) assert.throws(() => eventData({ ...event, date }));
  assert.equal(eventData({ ...event, date: '2024-02-29' }).date, '2024-02-29');
  for (const patch of [{ title: ' ' }, { title: 'a'.repeat(121) }, { description: 'a'.repeat(1501) }, { tags: [] }, { pinOrder: 0.5 }, { pinOrder: 10001 }, { published: 'true' }, { art: 'unknown' }]) assert.throws(() => eventData({ ...event, ...patch }));
  assert.equal(eventData(event).title, 'Campus festival');
  assert.throws(() => eventData(null));
});

test('links reject script URLs, deceptive hosts, credentials and oversized URLs', () => {
  for (const link of ['javascript:alert(1)', 'http://drive.google.com/folder', 'https://drive.google.com.evil.example/folder', 'https://evil.example/drive.google.com', 'https://user:password@drive.google.com/folder', 'https://drive.google.com/' + 'a'.repeat(2050), { url: 'https://drive.google.com' }]) assert.equal(httpsUrl(link, true), false);
  assert.equal(httpsUrl('https://docs.google.com/document/d/example', true), true);
  assert.equal(httpsUrl('https://instagram.com/p/example'), true);
});

test('photo walk updates preserve the fixed eight slots and only accepted fields', () => {
  const walk = { title: ' City walk ', url: 'https://example.com/photo.jpg', link: 'https://instagram.com/p/example', role: 'Admin' };
  for (let slot = 0; slot < 8; slot++) assert.equal(walkData(walk, slot).slot, slot);
  for (const slot of [-1, 8, NaN, 0.5]) assert.throws(() => walkData(walk, slot));
  assert.equal(walkData(walk, 0).role, undefined);
  assert.equal(walkData(walk, 0).title, 'City walk');
});

test('contact validation handles bad inputs and unconfigured email without sending mail', async () => {
  const { submitContact } = require('./controllers/contactController');
  let code, body;
  const res = { status(value) { code = value; return this; }, json(value) { body = value; } };
  await submitContact({ body: { name: 'Test', mobile: '123', purpose: 'x'.repeat(1001) } }, res);
  assert.equal(code, 400); assert.ok(body.errors.mobile); assert.ok(body.errors.purpose);
  const saved = process.env.SMTP_PASS;
  delete process.env.SMTP_PASS;
  try {
    await submitContact({ body: { name: 'Test', mobile: '9876543210' } }, res);
    assert.equal(code, 503); assert.equal(body.success, false);
  } finally { if (saved !== undefined) process.env.SMTP_PASS = saved; }
});
