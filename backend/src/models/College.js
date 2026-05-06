import mongoose from 'mongoose';

const collegeSchema = mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  students: { type: String, default: '1,000+' },
  posts: { type: String, default: '100+' },
  departments: { type: Number, default: 5 },
  emoji: { type: String, default: '🎓' },
  accent: { type: String, default: '#6366f1' },
  banner: { type: String, default: 'https://images.unsplash.com/photo-1523050335456-c38a7047d28c?w=800&q=80' },
  description: { type: String, default: '' }
}, { timestamps: true });

const College = mongoose.model('College', collegeSchema);
export default College;
