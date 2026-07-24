const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://lakshayyadav288_db_user:e8jJj6mu2zV721zM@cluster0.jbx5ljd.mongodb.net/collegeadda?retryWrites=true&w=majority').then(async () => {
  const Post = mongoose.model('Post', new mongoose.Schema({ content: String, createdAt: Date, author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }));
  const posts = await Post.find({}).sort({ createdAt: -1 }).select('createdAt content').limit(15);
  console.log(posts.map(p => ({
    date: p.createdAt,
    text: p.content ? p.content.substring(0, 15) : ''
  })));
  process.exit(0);
}).catch(console.error);
