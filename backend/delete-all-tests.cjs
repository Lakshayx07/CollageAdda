const mongoose = require('mongoose');
require('dotenv').config();

async function cleanAll() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lakshayyadav288_db_user:e8jJj6mu2zV721zM@cluster0.jbx5ljd.mongodb.net/collegeadda?retryWrites=true&w=majority');
  console.log("Connected");
  
  // Find test users
  const testUsers = await mongoose.connection.db.collection('users').find({
    $or: [
      { email: { $regex: /@example\.com/i } },
      { email: { $regex: /super-fast/i } },
      { email: { $regex: /useridcheck/i } },
      { email: { $regex: /api-/i } },
      { email: { $regex: /test/i } },
      { name: { $regex: /Super Fast API/i } },
      { name: { $regex: /Lakshay Production Test/i } },
      { name: { $regex: /User ID Check/i } }
    ]
  }).toArray();
  
  if (testUsers.length > 0) {
    const testUserIds = testUsers.map(u => u._id);
    
    // Delete their posts
    const postsRes = await mongoose.connection.db.collection('posts').deleteMany({
      author: { $in: testUserIds }
    });
    console.log("Deleted test posts:", postsRes.deletedCount);
    
    // Delete the users
    const usersRes = await mongoose.connection.db.collection('users').deleteMany({
      _id: { $in: testUserIds }
    });
    console.log("Deleted test users:", usersRes.deletedCount);
  } else {
    console.log("No more test users found.");
  }
  
  process.exit(0);
}
cleanAll().catch(console.error);
