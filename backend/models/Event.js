const mongoose = require('mongoose');

module.exports = mongoose.model('Event', new mongoose.Schema({
  title: { type: String, required: true, maxlength: 120 },
  date: { type: String, required: true },
  description: { type: String, default: '', maxlength: 1500 },
  tags: { type: String, default: '', maxlength: 300 },
  driveUrl: { type: String, required: true },
  published: { type: Boolean, default: false },
  pinned: { type: Boolean, default: false },
  pinOrder: { type: Number, default: 0 },
  art: { type: String, enum: ['ember', 'dusk', 'aurora', 'glacier', 'verdant'], default: 'ember' },
}, { timestamps: true }));
