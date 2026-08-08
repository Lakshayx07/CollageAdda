import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

import User from '../src/models/User.js';
import Post from '../src/models/Post.js';
import Story from '../src/models/Story.js';

const syncXp = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const users = await User.find({});
    console.log(`Found ${users.length} users. Syncing XP...`);

    let updatedCount = 0;

    for (const user of users) {
      const followersPoints = (user.followers?.length || 0) * 5;
      const followingPoints = (user.following?.length || 0) * 2;
      
      const postCount = await Post.countDocuments({ author: user._id });
      const postPoints = postCount * 10;
      
      const storyCount = await Story.countDocuments({ author: user._id });
      const storyPoints = storyCount * 3;
      
      const newXp = followersPoints + followingPoints + postPoints + storyPoints;
      
      if (user.xp !== newXp) {
        user.xp = newXp;
        await user.save();
        updatedCount++;
      }
    }

    console.log(`Successfully updated XP for ${updatedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Error syncing XP:', error);
    process.exit(1);
  }
};

syncXp();
