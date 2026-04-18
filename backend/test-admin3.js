const mongoose = require('mongoose');
const User = require('./src/models/User');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/agri_assist');
  const u = await User.findOne({ email: 'sandhyamajhi77@gmail.com' }).select('+password');
  console.log('Admin pw:', u.password);
  console.log('Match admin123:', await u.matchPassword('admin123'));
  console.log('Match Admin123!:', await u.matchPassword('Admin123!'));
  
  process.exit(0);
}
run();
