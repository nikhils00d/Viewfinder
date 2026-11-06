require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
async function main() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = 'Confluenz Admin' } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters).');
  await mongoose.connect(process.env.MONGO_URI);
  let user = await User.findOne({ email: ADMIN_EMAIL });
  if (!user) user = new User({ email: ADMIN_EMAIL, name: ADMIN_NAME, phone: 'not provided' });
  user.password = ADMIN_PASSWORD;
  user.role = 'Admin'; user.status = 'active';
  await user.save();
  console.log('Administrator account saved.');
}
main().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
