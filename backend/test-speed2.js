import jwt from 'jsonwebtoken';
import { performance } from 'perf_hooks';
import fetch from 'node-fetch'; // using node-fetch to avoid undici json bugs in old node

const token = jwt.sign({ id: "6699a224c653063f1ecb3d4a" }, "collegeadda_dev_secret_key_2026_super_secure_9a8b7c6d5e4f3g2h1");

async function measure(name, url) {
  const start = performance.now();
  try {
    const res = await fetch(`http://localhost:5001${url}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const text = await res.text();
    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(2)}ms (Status: ${res.status}, Size: ${text.length} bytes)`);
  } catch (err) {
    console.log(`${name}: Error - ${err.message}`);
  }
}

async function run() {
  await measure("Daily Drop", "/api/users/daily-drop");
  await measure("Search Query", "/api/users/search/query");
  await measure("Chat Rooms", "/api/chat/rooms");
}

run();
