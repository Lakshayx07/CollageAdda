import http from 'http';
import { performance } from 'perf_hooks';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

function measure(name, path, token) {
  return new Promise((resolve) => {
    const start = performance.now();
    const req = http.request({
      hostname: 'localhost', port: 5001, path, method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const ms = (performance.now() - start).toFixed(0);
        const kb = (data.length / 1024).toFixed(1);
        console.log(`${name}: ${ms}ms | ${kb} KB | status ${res.statusCode}`);
        resolve();
      });
    });
    req.on('error', (e) => { console.log(`${name}: ERROR - ${e.message}`); resolve(); });
    req.end();
  });
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const UserCol = mongoose.connection.db.collection('users');
  const user = await UserCol.findOne({});
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  await mongoose.disconnect();
  
  console.log('--- Endpoint Speed Test ---');
  await measure("Chat Rooms      ", "/api/chat/rooms", token);
  await measure("Daily Drop      ", "/api/users/daily-drop", token);
  await measure("Search Query    ", "/api/users/search/query", token);
  await measure("Profile         ", "/api/users/profile", token);
}
run().catch(e => { console.error(e); process.exit(1); });
