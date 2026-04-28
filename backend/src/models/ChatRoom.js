import mongoose from 'mongoose';

const chatRoomSchema = mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isGroup: { type: Boolean, default: false },
  groupName: { type: String },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  university: { type: String }, // For university-wide channels
  unreadCounts: {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true });

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);
export default ChatRoom;
