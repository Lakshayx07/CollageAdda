const mongoose = require('mongoose');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lakshayyadav288_db_user:e8jJj6mu2zV721zM@cluster0.jbx5ljd.mongodb.net/collegeadda?retryWrites=true&w=majority');
  console.log("Connected");
  
  const stats = await mongoose.connection.db.collection('posts').stats();
  console.log("Posts Collection Size (bytes):", stats.size);
  console.log("Average Object Size (bytes):", stats.avgObjSize);
  console.log("Count:", stats.count);
  
  process.exit(0);
}
test().catch(console.error);
