import jwt from 'jsonwebtoken';
import { performance } from 'perf_hooks';

const token = jwt.sign({ id: "667a12345678901234567890" }, "collegeadda_dev_secret_key_2026_super_secure_9a8b7c6d5e4f3g2h1");

async function measure(name, url) {
  const start = performance.now();
  const res = await fetch(`http://localhost:5001${url}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const end = performance.now();
  console.log(`${name}: ${(end - start).toFixed(2)}ms (Status: ${res.status}, Size: ${JSON.stringify(data).length} bytes)`);
}

async function run() {
  await measure("Posts", "/api/posts");
  await measure("Stories", "/api/stories");
  await measure("Confessions", "/api/confessions");
  await measure("Chat Rooms", "/api/chat/rooms");
  await measure("Users (Squad)", "/api/users?university=Rishihood%20University");
}

run();
