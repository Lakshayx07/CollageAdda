import mongoose from 'mongoose';

const chatRoomSchema = mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  isGroup: { type: Boolean, default: false },
  groupName: { type: String },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  university: { type: String }, // For university-wide channels
  unreadCounts: {
    type: Map,
    of: Number,
    default: {}
  },
  // Users who already got a one-shot inbox "surface to top" for an empty DM
  surfacedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Compound index to optimize sorting chat rooms for a user
chatRoomSchema.index({ participants: 1, updatedAt: -1 });

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);
export default ChatRoom;
