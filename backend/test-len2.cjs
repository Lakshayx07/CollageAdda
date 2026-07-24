const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://lakshayyadav288_db_user:e8jJj6mu2zV721zM@cluster0.jbx5ljd.mongodb.net/collegeadda?retryWrites=true&w=majority').then(async () => {
  const Post = mongoose.model('Post', new mongoose.Schema({}, { strict: false }));
  const posts = await Post.find({}).sort({ createdAt: -1 }).lean();
  console.log('TOTAL POSTS IN DB:', posts.length);
  process.exit(0);
}).catch(console.error);
