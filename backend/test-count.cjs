const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lakshayyadav288_db_user:e8jJj6mu2zV721zM@cluster0.jbx5ljd.mongodb.net/collegeadda?retryWrites=true&w=majority');
  const count = await mongoose.connection.db.collection('posts').countDocuments();
  console.log("Total Posts:", count);
  process.exit(0);
}
check().catch(console.error);
