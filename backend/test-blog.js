const mongoose = require('mongoose');
const BlogPost = require('./src/models/BlogPost');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/agri_assist');
  const post = await BlogPost.findOne({}).sort({createdAt: -1});
  console.log(post);
  process.exit(0);
}
run();
