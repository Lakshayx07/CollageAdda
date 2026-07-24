async function testFetch() {
  const registerRes = await fetch('http://localhost:5001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Fetcher 12',
      email: `fetcher12${Date.now()}@example.com`,
      password: 'password123',
      university: 'Delhi University (DU)',
      year: '1'
    })
  });
  const authData = await registerRes.json();
  
  const postsRes = await fetch('http://localhost:5001/api/posts?limit=12', {
    headers: { 'Authorization': `Bearer ${authData.token}` }
  });
  const posts = await postsRes.json();
  console.log(JSON.stringify(posts.map(p => ({ u: p.university, a: p.author?.name, t: p.content?.substring(0, 20) })), null, 2));
}
testFetch().catch(console.error);
