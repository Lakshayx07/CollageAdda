import mongoose from 'mongoose';
import 'dotenv/config';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = mongoose.connection.db.collection('users');
  
  const user = await User.findOne({ name: "Akshat Chauhan" });
  if (user) {
    console.log(`Akshat Chauhan profilePic length: ${user.profilePic?.length || 0} bytes`);
    console.log(`Akshat Chauhan profilePic preview: ${user.profilePic?.substring(0, 50)}...`);
  }
  process.exit(0);
}
run();
