import mongoose from 'mongoose';
import 'dotenv/config';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const rooms = mongoose.connection.db.collection('chatrooms');
  const users = mongoose.connection.db.collection('users');
  
  // Find the user with the most rooms
  const pipeline = [
    { $unwind: "$participants" },
    { $group: { _id: "$participants", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ];
  const topUsers = await rooms.aggregate(pipeline).toArray();
  
  for (const tu of topUsers) {
    const u = await users.findOne({ _id: tu._id });
    const userName = u?.name || 'Unknown';
    
    // Check how big the user document is
    const userJson = JSON.stringify(u);
    const followersSize = u?.followers?.length || 0;
    const followingSize = u?.following?.length || 0;
    
    console.log(`User: ${userName} | Rooms: ${tu.count} | Doc: ${(userJson.length/1024).toFixed(0)}KB | followers: ${followersSize} | following: ${followingSize}`);
  }
  
  // Also count total rooms
  const totalRooms = await rooms.countDocuments({});
  console.log(`\nTotal rooms in DB: ${totalRooms}`);
  
  process.exit(0);
}
run();
