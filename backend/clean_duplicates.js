import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    for (const user of users) {
      let modified = false;
      
      const uniqueFollowers = [];
      const followerSet = new Set();
      for (const id of user.followers) {
        if (!followerSet.has(id.toString())) {
          followerSet.add(id.toString());
          uniqueFollowers.push(id);
        }
      }
      
      if (uniqueFollowers.length !== user.followers.length) {
        user.followers = uniqueFollowers;
        modified = true;
      }
      
      const uniqueFollowing = [];
      const followingSet = new Set();
      for (const id of user.following) {
        if (!followingSet.has(id.toString())) {
          followingSet.add(id.toString());
          uniqueFollowing.push(id);
        }
      }
      
      if (uniqueFollowing.length !== user.following.length) {
        user.following = uniqueFollowing;
        modified = true;
      }
      
      if (modified) {
        await user.save();
        console.log(`Cleaned duplicates for user: ${user.name}`);
      }
    }
    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
