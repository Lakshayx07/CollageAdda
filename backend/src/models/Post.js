import mongoose from 'mongoose';

const postSchema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  university: { type: String, required: true },
  content: { type: String, required: true },
  mediaUrl: { type: String }, // image or video URL
  mediaType: { type: String }, // 'image' or 'video'
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  isAnonymous: { type: Boolean, default: false },
  hashtags: [{ type: String }],
  poll: {
    question: { type: String },
    options: [{
      text: { type: String },
      votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }]
  }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
export default Post;
