const http = require('http');
async function test() {
  const res = await fetch('http://localhost:5001/api/posts?limit=20', {
    headers: { 'Authorization': `Bearer ${process.env.TEST_TOKEN}` }
  });
  // Wait, I need a token to get posts, then get media ID.
  // Since it's public, I can just query the DB directly to find the ID.
}
