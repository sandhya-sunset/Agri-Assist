const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/agri-assist');
  
  // create dummy
  let u = await User.findOne({ email: 'test@agri.com' });
  if (u) await User.deleteOne({ _id: u._id });
  
  u = new User({
    name: 'test',
    email: 'test@agri.com',
    password: 'password123',
    phone: '1234567890',
    address: 'home',
    role: 'user'
  });
  await u.save();
  console.log('User created:', u._id);

  // fetch with password
  const u2 = await User.findById(u._id).select('+password');
  console.log('Fetched user, has password:', !!u2.password);
  
  const isMatch = await u2.matchPassword('password123');
  console.log('Password match:', isMatch);
  
  u2.password = 'newpw123';
  await u2.save();
  console.log('Password updated and saved');
  
  const u3 = await User.findById(u._id).select('+password');
  const isMatchNew = await u3.matchPassword('newpw123');
  console.log('New Password match:', isMatchNew);
  console.log('Old Password match:', await u3.matchPassword('password123'));
  
  process.exit(0);
}
run().catch(console.error);
