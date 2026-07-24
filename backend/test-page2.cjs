const http = require('http');

async function testFetch() {
  const registerRes = await fetch('http://localhost:5001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Fetcher Page 2',
      email: `fetcher-page2-${Date.now()}@example.com`,
      password: 'password123',
      university: 'Delhi University (DU)',
      year: '1'
    })
  });
  const authData = await registerRes.json();
  
  const postsRes = await fetch('http://localhost:5001/api/posts?page=2&limit=12', {
    headers: { 'Authorization': `Bearer ${authData.token}` }
  });
  const posts = await postsRes.json();
  console.log('PAGE 2 POSTS COUNT:', posts.length);
  if (posts.length > 0) {
    console.log(posts[0].content ? posts[0].content.substring(0, 20) : 'no content');
  }
}
testFetch().catch(console.error);
