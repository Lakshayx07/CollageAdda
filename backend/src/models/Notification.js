import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['like', 'comment', 'follow', 'message', 'story_like'], 
    required: true 
  },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' },
  chatRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom' },
  text: { type: String },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
