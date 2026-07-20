import mongoose from 'mongoose';

const collegeSchema = mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  students: { type: String, default: '1,000+' },
  posts: { type: String, default: '100+' },
  departments: { type: Number, default: 5 },
  emoji: { type: String, default: '🎓' },
  logo: { type: String, default: '' },
  accent: { type: String, default: '#6366f1' },
  banner: { type: String, default: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80' },
  description: { type: String, default: '' },
  category: {
    type: String,
    default: 'General',
    enum: ['IIT', 'NIT', 'Engineering', 'Medical', 'Law', 'Design', 'General']
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const College = mongoose.model('College', collegeSchema);
export default College;
