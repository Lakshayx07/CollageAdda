import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import User from './src/models/User.js';
import Post from './src/models/Post.js';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const users = await User.find({}).select('name university followers following').limit(5).lean();
  
  const userIds = users.map(u => u._id);
  const universities = [...new Set(users.map(u => u.university))].filter(Boolean);
  
  console.log("Universities:", universities);
  
  const uniScoresAgg = await User.aggregate([
    { $match: { university: { $in: universities } } },
    { $project: { university: 1, score: { $add: [{ $size: { $ifNull: ['$followers', []] } }, { $size: { $ifNull: ['$following', []] } }] } } }
  ]);
  
  console.log("uniScoresAgg size:", uniScoresAgg.length);
  
  const scoresByUni = {};
  for (const doc of uniScoresAgg) {
    if (!scoresByUni[doc.university]) scoresByUni[doc.university] = [];
    scoresByUni[doc.university].push(doc.score);
  }
  
  const usersWithPostsCount = users.map(u => {
    const fc = { followersCount: u.followers?.length || 0, followingCount: u.following?.length || 0 };
    const myScore = (fc.followersCount || 0) + (fc.followingCount || 0);
    let campusRank = null;
    if (u.university && scoresByUni[u.university]) {
      let higherScoringUsers = 0;
      for (const score of scoresByUni[u.university]) {
        if (score > myScore) higherScoringUsers++;
      }
      campusRank = higherScoringUsers + 1;
    }
    return { name: u.name, campusRank, score: myScore };
  });

  console.log("Results:");
  console.log(usersWithPostsCount);

  process.exit(0);
}

run();
