import jwt from 'jsonwebtoken';
import http from 'http';
import { performance } from 'perf_hooks';

const token = jwt.sign({ id: "6699a224c653063f1ecb3d4a" }, "collegeadda_dev_secret_key_2026_super_secure_9a8b7c6d5e4f3g2h1");

function measure(name, path) {
  return new Promise((resolve) => {
    const start = performance.now();
    const req = http.request({
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const end = performance.now();
        console.log(`${name}: ${(end - start).toFixed(2)}ms (Status: ${res.statusCode}, Size: ${data.length} bytes)`);
        resolve();
      });
    });
    req.on('error', (e) => {
      console.log(`${name}: Error - ${e.message}`);
      resolve();
    });
    req.end();
  });
}

async function run() {
  await measure("Daily Drop", "/api/users/daily-drop");
  await measure("Search Query", "/api/users/search/query");
  await measure("Chat Rooms", "/api/chat/rooms");
}
run();
