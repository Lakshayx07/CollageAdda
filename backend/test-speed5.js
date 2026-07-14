import http from 'http';
import { performance } from 'perf_hooks';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZjEyYzFhNDNmZTU4ZDQ2MjNlMTJmNiIsImlhdCI6MTc4NDA0MjcwMH0.xalpwKOhwgCoQPayZKholpH0W1yQkia4RFJRzyFeBiI";

function measure(name, path) {
  return new Promise((resolve) => {
    const start = performance.now();
    const req = http.request({
      hostname: 'localhost', port: 5001, path, method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const ms = (performance.now() - start).toFixed(2);
        const kb = (data.length / 1024).toFixed(1);
        console.log(`${name}: ${ms}ms | ${kb} KB | status: ${res.statusCode}`);
        resolve();
      });
    });
    req.on('error', (e) => { console.log(`${name}: ERROR - ${e.message}`); resolve(); });
    req.end();
  });
}

async function run() {
  await measure("Daily Drop (squad users)", "/api/users/daily-drop");
  await measure("Search Query (squad all)", "/api/users/search/query");
  await measure("Chat Rooms (messages)", "/api/chat/rooms");
}
run();
