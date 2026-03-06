const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: '../.env' });

async function testPasswordUpdate() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agriassist');
  const user = await User.findOne({ email: 'sandhyamajhi77@gmail.com' }).select('+password');
  if (!user) {
    console.log('User not found');
    process.exit();
  }
  
  try {
    const isMatch = await user.matchPassword('password123'); // Assume this was the password
    console.log('Original Password Match (password123):', isMatch);
    
    // Simulate update
    user.password = 'newpassword123';
    await user.save();
    console.log('Saved successfully');
  } catch (err) {
    console.error('Save failed:', err.message);
  }
  process.exit();
}

testPasswordUpdate();
