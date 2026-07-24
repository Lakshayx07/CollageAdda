async function testFetch() {
  const registerRes = await fetch('http://localhost:5001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Fetcher API',
      email: `fetcher-api-${Date.now()}@example.com`,
      password: 'password123',
      university: 'Delhi University (DU)',
      year: '1'
    })
  });
  const authData = await registerRes.json();
  
  const postsRes = await fetch('http://localhost:5001/api/posts?limit=30', {
    headers: { 'Authorization': `Bearer ${authData.token}` }
  });
  const posts = await postsRes.json();
  console.log('LIMIT 30 POSTS COUNT:', posts.length);
  process.exit(0);
}
testFetch().catch(console.error);
