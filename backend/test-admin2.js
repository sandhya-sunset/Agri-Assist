const mongoose = require('mongoose');
const User = require('./src/models/User');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/agri_assist');
  const users = await User.find({}).lean();
  console.log(users.map(u => ({ email: u.email, role: u.role, isVerified: u.isVerified, p: !!u.password })));
  process.exit(0);
}
run();
