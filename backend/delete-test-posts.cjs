const mongoose = require('mongoose');
require('dotenv').config();

async function clean() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lakshayyadav288_db_user:e8jJj6mu2zV721zM@cluster0.jbx5ljd.mongodb.net/collegeadda?retryWrites=true&w=majority');
  console.log("Connected");
  
  const result = await mongoose.connection.db.collection('posts').deleteMany({
    content: { $regex: /API test post/i }
  });
  console.log("Deleted test posts by content:", result.deletedCount);

  // Also delete test users
  const userResult = await mongoose.connection.db.collection('users').deleteMany({
    name: { $regex: /Lakshay Production Test/i }
  });
  console.log("Deleted test users:", userResult.deletedCount);
  
  process.exit(0);
}
clean().catch(console.error);
