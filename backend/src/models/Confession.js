import mongoose from 'mongoose';

const confessionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  college: {
    type: String,
    required: true,
    trim: true
  },
  gradient: {
    type: String,
    default: "from-orange-500 via-rose-500 to-purple-600"
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  heat: {
    type: Number,
    default: 1
  },
  reports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Automatically delete after 24 hours (86400 seconds)
  }
});

// Update heat automatically before saving if likes or comments changed
confessionSchema.pre('save', function(next) {
  this.heat = 1 + (this.likes.length * 2) + (this.comments.length * 3);
  next();
});

const Confession = mongoose.models.Confession || mongoose.model('Confession', confessionSchema);

export default Confession;
