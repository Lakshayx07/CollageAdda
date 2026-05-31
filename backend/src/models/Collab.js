import mongoose from 'mongoose';

const collabSchema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  university: { type: String, required: true },

  // Structured metadata (Pillar 3)
  skillset: { type: String, required: true },       // "React, Node.js, Figma"
  building: { type: String, required: true },       // "AI-powered study assistant"
  yearMajor: { type: String, required: true },      // "3rd Year, CSE"
  projectType: {
    type: String,
    enum: ['Hackathon', 'Startup', 'Research', 'Side Project', 'Society', 'Other'],
    default: 'Side Project'
  },
  rolesNeeded: [{ type: String }],                 // ["Backend Dev", "UI Designer"]
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  description: { type: String, default: '' },

  // Interactions
  interests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // users who swiped right
}, { timestamps: true });

// Index by university for fast local filtering
collabSchema.index({ university: 1 });

const Collab = mongoose.models.Collab || mongoose.model('Collab', collabSchema);
export default Collab;
