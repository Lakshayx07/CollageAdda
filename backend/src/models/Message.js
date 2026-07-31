import mongoose from 'mongoose';

const messageSchema = mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String },
  mediaUrl: { type: String },
  mediaType: { 
    type: String, 
    enum: ['image', 'video', 'file', 'none'], 
    default: 'none' 
  },
  replyTo: {
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    text: { type: String },
    senderName: { type: String }
  },
  poll: {
    question: { type: String },
    allowMultiple: { type: Boolean, default: false },
    options: [{
      text: { type: String },
      votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }]
  },
  sharedPost: {
    postId: { type: String },
    authorName: { type: String },
    authorAvatar: { type: String },
    authorUniversity: { type: String },
    authorTime: { type: String },
    content: { type: String },
    mediaUrl: { type: String },
    mediaType: { type: String }
  },
  isPinned: { type: Boolean, default: false },
  editedAt: { type: Date },
  deletedAt: { type: Date },
  seenBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    seenAt: { type: Date, default: Date.now }
  }],
  isSystem: { type: Boolean, default: false },
}, { timestamps: true });

// Compound index to optimize querying messages for a room sorted by time
messageSchema.index({ room: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
