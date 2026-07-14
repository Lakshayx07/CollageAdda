import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const user = await User.findOne({});
  if (user) {
    console.log(jwt.sign({ id: user._id }, process.env.JWT_SECRET));
  }
  process.exit(0);
}
run();
