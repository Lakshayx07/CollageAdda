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
