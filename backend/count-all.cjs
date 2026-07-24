const mongoose = require('mongoose');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const count = await mongoose.connection.db.collection('posts').countDocuments();
  console.log("TOTAL POSTS:", count);
  process.exit(0);
}
run();
