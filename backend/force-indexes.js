import mongoose from 'mongoose';
import 'dotenv/config';

import ChatRoom from './src/models/ChatRoom.js';
import Message from './src/models/Message.js';
import User from './src/models/User.js';
import Post from './src/models/Post.js';
import Story from './src/models/Story.js';

async function run() {
  console.log("Connecting to DB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Forcing index sync...");
  await User.syncIndexes();
  await ChatRoom.syncIndexes();
  await Message.syncIndexes();
  await Post.syncIndexes();
  await Story.syncIndexes();
  console.log("Indexes built successfully!");
  process.exit(0);
}
run();
