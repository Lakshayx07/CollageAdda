const http = require('http');
async function test() {
  console.log("STARTING");
  const res = await fetch('http://localhost:5001/api/posts?limit=2');
  console.log("STATUS:", res.status);
  console.log("DONE");
  process.exit(0);
}
test().catch(console.error);
