const mongoose = require('mongoose');
const User = require('./src/models/User');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/agri-assist');
  
  const u = await User.findOne({ role: 'admin' });
  console.log(u ? 'Admin email: ' + u.email + ' Verified: ' + u.isVerified : 'No admin');
  
  const pwMatch = await User.findOne({ role: 'admin' }).select('+password');
  console.log('Admin password match with admin123: ', await pwMatch.matchPassword('admin123'));
  console.log('Admin password match with Admin123!: ', await pwMatch.matchPassword('Admin123!'));
  
  process.exit(0);
}
run();
