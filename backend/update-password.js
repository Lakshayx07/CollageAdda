import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/collageadda');
  
  const email = 'abhiman.singh2024@nst.rishihood.edu.in'.toLowerCase();
  const user = await User.findOne({ email });
  
  if (user) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Abhiman@123', salt);
    
    // We update using updateOne to bypass any other hooks just in case, or just set password and save
    user.password = hash;
    await user.save();
    console.log('Password updated successfully for', email);
  } else {
    console.log('User not found');
  }
  
  process.exit(0);
};

run().catch(console.error);
