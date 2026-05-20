import mongoose from 'mongoose';

const listingSchema = mongoose.Schema({
  title: { type: String, required: true },
  price: { type: String, required: true },
  condition: { type: String }, // thrift only
  type: { type: String, required: true, enum: ['thrift', 'gig'] },
  gigType: { type: String }, // gig only
  comment: { type: String, required: true },
  image: { type: String }, // base64 photo
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;
