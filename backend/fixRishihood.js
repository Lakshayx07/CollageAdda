import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Confession from './src/models/Confession.js';
import ChatRoom from './src/models/ChatRoom.js';

const fixRishihood = async () => {
  await connectDB();
  console.log('Connected. Starting Rishihood fix...\n');

  const oldName = 'Rishihood University Sonipat';
  const newName = 'Rishihood University';

  const userRes = await User.updateMany(
    { university: oldName },
    { $set: { university: newName } }
  );
  console.log(`Updated ${userRes.modifiedCount} users.`);

  const confRes = await Confession.updateMany(
    { college: oldName },
    { $set: { college: newName } }
  );
  console.log(`Updated ${confRes.modifiedCount} confessions.`);

  const chatRes = await ChatRoom.updateMany(
    { university: oldName },
    { $set: { university: newName } }
  );
  console.log(`Updated ${chatRes.modifiedCount} chat rooms.`);

  console.log('\n✅ Fix complete! Now run migrateUniversityGroups.js to merge any duplicate groups.');
  process.exit(0);
};

fixRishihood().catch(err => {
  console.error('Fix failed:', err);
  process.exit(1);
});
