import mongoose from 'mongoose';
import 'dotenv/config';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const rooms = mongoose.connection.db.collection('chatrooms');
  
  // Count total rooms for a user
  const user = await mongoose.connection.db.collection('users').findOne({});
  const count = await rooms.countDocuments({ participants: user._id });
  console.log(`Total chat rooms for first user: ${count}`);
  
  // Get one room to check its size
  const oneRoom = await rooms.findOne({ participants: user._id });
  const roomJson = JSON.stringify(oneRoom);
  console.log(`Single room JSON size: ${(roomJson.length / 1024).toFixed(1)} KB`);
  console.log(`Room keys: ${Object.keys(oneRoom)}`);
  
  // Check unreadCounts size
  if (oneRoom.unreadCounts) {
    console.log(`unreadCounts entries: ${Object.keys(oneRoom.unreadCounts).length}`);
  }
  
  // Check participants array
  console.log(`participants count: ${oneRoom.participants?.length}`);
  
  // Count total messages
  const msgCount = await mongoose.connection.db.collection('messages').countDocuments({});
  console.log(`\nTotal messages in DB: ${msgCount}`);
  
  process.exit(0);
}
run();
