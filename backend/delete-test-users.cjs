const mongoose = require('mongoose');
require('dotenv').config();

async function clean() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lakshayyadav288_db_user:e8jJj6mu2zV721zM@cluster0.jbx5ljd.mongodb.net/collegeadda?retryWrites=true&w=majority');
  console.log("Connected");
  
  const result = await mongoose.connection.db.collection('users').deleteMany({
    $or: [
      { name: { $regex: /Super Fast API/i } },
      { name: { $regex: /User ID Check/i } },
      { email: { $regex: /super-fast/i } },
      { email: { $regex: /useridcheck/i } }
    ]
  });
  console.log("Deleted test users:", result.deletedCount);
  
  process.exit(0);
}
clean().catch(console.error);
