import mongoose from 'mongoose';

const listingSchema = mongoose.Schema({
  title: { type: String, required: true },
  price: { type: String, required: true },
  condition: { type: String }, // thrift only
  type: { type: String, required: true, enum: ['thrift', 'gig'] },

  // Thrift fields
  gigType: { type: String }, // legacy

  // Structured Gig Metadata (Pillar 3)
  roleNeeded: { type: String, default: '' },     // e.g. "Frontend Dev", "Video Editor"
  projectType: { type: String, default: '' },    // e.g. "Startup", "Hackathon", "Freelance"
  compensation: { type: String, default: '' },   // e.g. "₹500/hr", "Equity", "Learning"

  comment: { type: String, required: true },
  image: { type: String }, // base64 photo
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;
