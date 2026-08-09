const mongoose = require('mongoose');
const User = require('./src/models/User.js').default;
const Post = require('./src/models/Post.js').default;

async function test() {
  await mongoose.connect('mongodb+srv://lakshayyadav288_db_user:e8jJj6mu2zV721zM@cluster0.jbx5ljd.mongodb.net/collegeadda?retryWrites=true&w=majority');
  console.log('Connected');
  const reqUser = await User.findOne({});
  let query = { _id: { $ne: reqUser._id } };

  console.log('1. User.find');
  const fields = 'name profilePic coverImage university bio interests year studyYear passOutBatch course branch isVerified xp points currentTick streak createdAt updatedAt'.split(' ');
  for (let i = 1; i <= fields.length; i++) {
    const f = fields.slice(0, i).join(' ');
    console.time('find ' + i);
    const users = await User.find(query).sort({ createdAt: -1 }).select(f).limit(100).lean();
    console.timeEnd('find ' + i);
  }
  console.log('Done!');

  console.log('2. User.countDocuments');
  const totalCount = await User.countDocuments(query);
  console.log('Count', totalCount);

  const userIds = users.map(u => u._id);

  console.log('3. Post.aggregate');
  const postCounts = await Post.aggregate([
    { $match: { author: { $in: userIds } } },
    { $group: { _id: '$author', count: { $sum: 1 } } }
  ]);
  console.log('Post counts', postCounts.length);

  console.log('4. User.aggregate 1');
  const followCounts = await User.aggregate([
    { $match: { _id: { $in: userIds } } },
    { $project: { followersCount: { $size: { $ifNull: ['$followers', []] } }, followingCount: { $size: { $ifNull: ['$following', []] } } } }
  ]);
  console.log('Follow counts', followCounts.length);

  console.log('5. User.aggregate 2');
  const universities = [...new Set(users.map(u => u.university))].filter(Boolean);
  const uniScoresAgg = await User.aggregate([
    { $match: { university: { $in: universities } } },
    { $project: { university: 1, score: { $add: [{ $size: { $ifNull: ['$followers', []] } }, { $size: { $ifNull: ['$following', []] } }] } } }
  ]);
  console.log('Uni scores', uniScoresAgg.length);

  process.exit(0);
}
test().catch(console.error);
