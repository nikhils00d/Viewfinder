const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Event = require('../models/Event');
const Photowalk = require('../models/Photowalk');
const router = express.Router();

async function admin(req, res, next) {
  try {
    const { userId } = jwt.verify(req.cookies.jwt || '', process.env.JWT_SECRET);
    const user = await User.findById(userId);
    if (!user || user.role !== 'Admin' || user.status !== 'active') return res.status(403).json({ message: 'Administrator access required' });
    req.user = user;
    next();
  } catch { res.status(401).json({ message: 'Please sign in' }); }
}

function httpsUrl(value, drive = false) {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && !u.username && !u.password && (!drive || ['drive.google.com', 'docs.google.com'].includes(u.hostname));
  } catch { return false; }
}

function eventData(body) {
  const { title, date, description = '', tags = '', driveUrl, published = false, pinned = false, pinOrder = 0, art = 'ember' } = body;
  if (typeof title !== 'string' || !title.trim() || title.length > 120 || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || !httpsUrl(driveUrl, true) || typeof published !== 'boolean' || typeof pinned !== 'boolean' || !Number.isFinite(pinOrder) || !['ember', 'dusk', 'aurora', 'glacier', 'verdant'].includes(art) || typeof description !== 'string' || description.length > 1500 || typeof tags !== 'string' || tags.length > 300) throw new Error('Enter a title, valid date, and HTTPS Google Drive link. Check field lengths and settings.');
  return { title: title.trim(), date, description, tags, driveUrl, published, pinned, pinOrder, art };
}

function sortEvents(rows) {
  return rows.sort((a, b) => Number(b.pinned) - Number(a.pinned) || (a.pinned && b.pinned ? a.pinOrder - b.pinOrder : 0) || b.date.localeCompare(a.date));
}
router.get('/events', async (req, res) => res.json(sortEvents(await Event.find({ published: true }).sort({ date: -1 }))));
router.get('/photowalks', async (req, res) => res.json(await Photowalk.find().sort({ slot: 1 })));
router.use('/admin', admin);
router.get('/admin/me', (req, res) => res.json({ name: req.user.name, email: req.user.email }));
router.get('/admin/events', async (req, res) => res.json(sortEvents(await Event.find().sort({ date: -1 }))));
router.post('/admin/events', async (req, res) => {
  let data;
  try { data = eventData(req.body); } catch (e) { return res.status(400).json({ message: e.message }); }
  res.status(201).json(await Event.create(data));
});
router.put('/admin/events/:id', async (req, res) => {
  let data;
  try { data = eventData(req.body); } catch (e) { return res.status(400).json({ message: e.message }); }
  const event = await Event.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
});
router.delete('/admin/events/:id', async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json({ message: 'Event deleted' });
});
router.put('/admin/photowalks/:slot', async (req, res) => {
  const slot = Number(req.params.slot);
  const { title, url, link, location = '', date = '' } = req.body;
  if (!Number.isInteger(slot) || slot < 0 || slot > 7 || typeof title !== 'string' || !title.trim() || title.length > 120 || !httpsUrl(url) || !httpsUrl(link) || typeof location !== 'string' || location.length > 120 || typeof date !== 'string' || date.length > 80) return res.status(400).json({ message: 'Enter a title and valid HTTPS thumbnail and destination URLs (slots 1–8 only).' });
  res.json(await Photowalk.findOneAndUpdate({ slot }, { slot, title: title.trim(), url, link, location, date }, { upsert: true, new: true, runValidators: true }));
});
module.exports = router;
