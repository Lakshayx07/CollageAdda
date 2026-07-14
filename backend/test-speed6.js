import http from 'http';
import { performance } from 'perf_hooks';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

async function getToken() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = mongoose.model('UserTmp', new mongoose.Schema({}, { strict: false }), 'users');
  const user = await User.findOne({});
  await mongoose.disconnect();
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
}

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
  const token = await getToken();
  console.log('--- Testing with fresh token ---');
  await measure("Chat Rooms      ", "/api/chat/rooms");
  await measure("Daily Drop      ", "/api/users/daily-drop");
  await measure("Search Query    ", "/api/users/search/query");
  await measure("Profile         ", "/api/users/profile");
}
run().catch(e => { console.error(e); process.exit(1); });
