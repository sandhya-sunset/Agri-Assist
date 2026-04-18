const mongoose = require('mongoose');
const User = require('./src/models/User');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/agri-assist');
  const users = await User.find({}).lean();
  console.log(users.map(u => ({ email: u.email, role: u.role })));
  process.exit(0);
}
run();
