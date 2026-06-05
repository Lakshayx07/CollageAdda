import dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/config/db.js';
import User from './src/models/User.js';

const diagnose = async () => {
  await connectDB();
  console.log('Connected. Scanning for Rishihood variants...\n');

  // Find all universities that contain "rishihood" (case-insensitive)
  const results = await User.aggregate([
    {
      $match: {
        university: { $regex: 'rishihood', $options: 'i' }
      }
    },
    {
      $group: {
        _id: '$university',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  if (results.length === 0) {
    console.log('No Rishihood users found in DB.');
  } else {
    console.log('Rishihood university variants found:');
    results.forEach(r => {
      console.log(`  "${r._id}" -> ${r.count} user(s)`);
    });
  }

  // Show total users for context
  const total = await User.countDocuments();
  console.log(`\nTotal users in DB: ${total}`);

  process.exit(0);
};

diagnose().catch(err => {
  console.error('Diagnosis failed:', err);
  process.exit(1);
});
