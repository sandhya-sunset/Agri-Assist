const mongoose = require('mongoose');
const User = require('./src/models/User');
const axios = require('axios');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/agri_assist');
  
  const u = await User.findOne({ email: 'sandhyamajhi77@gmail.com' });
  if(u) {
    u.password = 'admin123';
    await u.save();
    console.log('Password reset to admin123 directly in DB');
  }

  try {
    const resAuth = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'sandhyamajhi77@gmail.com',
      password: 'admin123'
    });
    console.log('Login:', resAuth.data.success);
    const token = resAuth.data.data.token;
    
    const resUpdate = await axios.put('http://localhost:5000/api/auth/update-password', {
      currentPassword: 'admin123',
      newPassword: 'admin1234!!'
    }, {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log('Update HTTP Status:', resUpdate.status, resUpdate.data);
  } catch(e) {
    console.error('Update Error:', e.response ? e.response.data : e.message);
  }
  
  process.exit(0);
}
run();
