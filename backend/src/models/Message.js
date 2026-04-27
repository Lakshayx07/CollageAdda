import mongoose from 'mongoose';

const messageSchema = mongoose.Schema({
  room: { type: String, required: true }, // university ID or DM room key
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  senderAvatar: { type: String, default: '' },
  text: { type: String, required: true },
  mediaUrl: { type: String },
  mediaType: { type: String }, // 'image' | 'video' | 'document'
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
export default Message;
