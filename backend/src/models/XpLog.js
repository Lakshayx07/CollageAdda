import mongoose from 'mongoose';

const xpLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  actionType: {
    type: String,
    required: true,
    enum: ['CONNECT_USER', 'CREATE_POST', 'CREATE_STORY', 'JOIN_COMMUNITY', 'LIKE_POST', 'COMMENT_POST']
  },
  xpAwarded: {
    type: Number,
    required: true
  },
  refId: {
    type: String, // E.g. 'post_123', 'like_456'
    required: true
  }
}, { timestamps: true });

// Ensure idempotency for actions that shouldn't be repeated
// user + actionType + refId must be unique
xpLogSchema.index({ user: 1, actionType: 1, refId: 1 }, { unique: true });

// For querying weekly/monthly activity quickly
xpLogSchema.index({ user: 1, actionType: 1, createdAt: -1 });

const XpLog = mongoose.model('XpLog', xpLogSchema);
export default XpLog;
