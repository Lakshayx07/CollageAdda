import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  university: { type: String, required: true },
  bio: { type: String, default: '' },
  hometownState: { type: String, default: '' },
  hometownDistrict: { type: String, default: '' },
  isPremium: { type: Boolean, default: false },
  profilePic: { type: String, default: '' },
  instagram: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
  phone: { type: String, default: '' },
  phonePrivacy: { type: String, enum: ['public', 'private'], default: 'private' },
  snapchat: { type: String, default: '' },
  interests: [{ type: String }],
  goals: [{ type: String }],
  sports: [{ type: String }],
  year: { type: String, default: '' },
  passOutBatch: { type: String, default: '' },
  course: { type: String, default: '' },
  branch: { type: String, default: '' },
  studyYear: { type: String, default: '' },
  onboardingComplete: { type: Boolean, default: false },
  onboardingStep: { type: Number, default: 1 },
  connectedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  skippedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Daily Drop feature
  dailyDropUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dailyDropDate: { type: Date },
  
  // Verification System Fields
  isVerified: { type: Boolean, default: false },
  verificationStatus: { 
    type: String, 
    enum: ['unverified', 'pending', 'verified', 'rejected'], 
    default: 'unverified' 
  },
  verificationMethod: { 
    type: String, 
    enum: ['email', 'manual', 'profile', 'none'], 
    default: 'none' 
  },
  collegeEmail: { type: String, sparse: true },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  idPhotoUrl: { type: String, default: '' },
  adminNotes: { type: String, default: '' },
  lastCoreProfileEditDate: { type: Date },

  // Growth Hacking Fields
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  xp: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  inviteCount: { type: Number, default: 0 },
  currentTick: { type: String, default: null },
  unlockedBadges: [{ badgeId: String, unlockedAt: Date }],

  // Streak & Login Fields
  streak: { type: Number, default: 0 },
  lastLoginDate: { type: Date },

  isAdmin: { type: Boolean, default: false }
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

// Indexes for performance
userSchema.index({ university: 1, points: -1 });
userSchema.index({ university: 1, createdAt: -1 });
userSchema.index({ createdAt: -1 }); // Fast generic sorting

const User = mongoose.model('User', userSchema);

export default User;
