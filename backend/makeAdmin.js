const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User.js');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB.");
    const email = 'ncsood2000@gmail.com';
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User ${email} not found. Creating it...`);
      const newUser = new User({
        name: 'Nikhil Sood',
        email: email,
        phone: '0000000000',
        password: 'AdminPassword123!',
        role: 'Admin',
        status: 'active'
      });
      await newUser.save();
      console.log(`User ${email} created as Admin and active. Password: AdminPassword123!`);
    } else {
      user.role = 'Admin';
      user.status = 'active';
      await user.save();
      console.log(`User ${email} is now an Admin and active.`);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
