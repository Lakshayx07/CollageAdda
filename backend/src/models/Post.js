import mongoose from 'mongoose';

const postSchema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  university: { type: String, required: true },
  content: { type: String },
  mediaUrl: { type: String }, // image or video URL
  mediaType: { type: String }, // 'image' or 'video'
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  hashtags: [{ type: String }],
  poll: {
    question: { type: String },
    options: [{
      text: { type: String },
      votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],
    allowMultiple: { type: Boolean, default: false }
  },
  isMemoryOnly: { type: Boolean, default: false }
}, { timestamps: true });

// Compound index to optimize the university feed query (GET /api/posts)
postSchema.index({ university: 1, createdAt: -1 });
// Index to optimize the global feed query
postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);
export default Post;
