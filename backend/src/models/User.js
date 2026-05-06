import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  university: { type: String, required: true },
  bio: { type: String, default: '' },
  isPremium: { type: Boolean, default: false },
  profilePic: { type: String, default: '' },
  instagram: { type: String, default: '' },
  snapchat: { type: String, default: '' },
  interests: [{ type: String }],
  goals: [{ type: String }],
  sports: [{ type: String }],
  year: { type: String, default: '' },
  connectedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  skippedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Verification System Fields
  isVerified: { type: Boolean, default: true },
  verificationStatus: { 
    type: String, 
    enum: ['unverified', 'pending', 'verified', 'rejected'], 
    default: 'verified' 
  },
  verificationMethod: { 
    type: String, 
    enum: ['email', 'manual', 'none'], 
    default: 'none' 
  },
  collegeEmail: { type: String, sparse: true },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  idPhotoUrl: { type: String, default: '' },
  adminNotes: { type: String, default: '' },

  // Growth Hacking Fields
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  points: { type: Number, default: 0 },
  inviteCount: { type: Number, default: 0 }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
