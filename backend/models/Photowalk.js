const mongoose = require('mongoose');

module.exports = mongoose.model('Photowalk', new mongoose.Schema({
  slot: { type: Number, required: true, unique: true, min: 0, max: 7 },
  title: { type: String, required: true, maxlength: 120 },
  url: { type: String, required: true },
  link: { type: String, required: true },
  location: { type: String, default: '', maxlength: 120 },
  date: { type: String, default: '', maxlength: 80 },
}, { timestamps: true }));
