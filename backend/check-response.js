import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import http from 'http';
import 'dotenv/config';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  // Get user with many rooms
  const u = await mongoose.connection.db.collection('users').findOne({ name: "College Adda " });
  const token = jwt.sign({ id: u._id }, process.env.JWT_SECRET);
  await mongoose.disconnect();
  
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost', port: 5001, path: '/api/chat/rooms', method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const rooms = JSON.parse(data);
        console.log(`Total rooms returned: ${rooms.length}`);
        console.log(`Total response size: ${(data.length/1024).toFixed(1)} KB`);
        if (rooms[0]) {
          const room = rooms[0];
          console.log(`\nFirst room keys: ${Object.keys(room)}`);
          if (room.participants?.[0]) {
            console.log(`First participant keys: ${Object.keys(room.participants[0])}`);
            console.log(`First participant size: ${JSON.stringify(room.participants[0]).length} bytes`);
          }
          if (room.lastMessage) {
            console.log(`lastMessage keys: ${Object.keys(room.lastMessage)}`);
          }
        }
        resolve();
      });
    });
    req.end();
  });
}
run();
