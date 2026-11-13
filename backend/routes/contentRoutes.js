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

const { eventData, walkData } = require('../utils/validateContent');

function sortEvents(rows) {
  return rows.sort((a, b) => Number(b.pinned) - Number(a.pinned) || (a.pinned && b.pinned ? a.pinOrder - b.pinOrder : 0) || b.date.localeCompare(a.date));
}
router.get('/events', async (req, res) => res.json(sortEvents(await Event.find({ published: true, section: { $ne: 'chitrakala' } }).sort({ date: -1 }))));
router.get('/collections', async (req, res) => res.json(sortEvents(await Event.find({ published: true, section: 'chitrakala' }).sort({ date: -1 }))));
router.get('/photowalks', async (req, res) => res.json(await Photowalk.find().sort({ slot: 1 })));
router.use('/admin', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); }, admin);
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
  let data;
  try { data = walkData(req.body, Number(req.params.slot)); } catch (e) { return res.status(400).json({ message: e.message }); }
  res.json(await Photowalk.findOneAndUpdate({ slot: data.slot }, data, { upsert: true, new: true, runValidators: true }));
});
module.exports = router;
