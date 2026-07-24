const mongoose = require('mongoose');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lakshayyadav288_db_user:e8jJj6mu2zV721zM@cluster0.jbx5ljd.mongodb.net/collegeadda?retryWrites=true&w=majority');
  console.log("Connected");
  
  const startUser = Date.now();
  await mongoose.connection.db.collection('users').findOne({});
  console.log("User query took:", Date.now() - startUser, "ms");

  const startPost = Date.now();
  await mongoose.connection.db.collection('posts').find({}).limit(20).toArray();
  console.log("Post query took:", Date.now() - startPost, "ms");
  
  process.exit(0);
}
test().catch(console.error);
