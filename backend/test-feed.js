async function testFeed() {
  const registerRes = await fetch('http://localhost:5001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      university: 'IIT Delhi',
      year: '1'
    })
  });
  
  const authData = await registerRes.json();
  if (!authData.token) {
    console.log('Failed to register:', authData);
    return;
  }
  
  const postsRes = await fetch('http://localhost:5001/api/posts?limit=10', {
    headers: { 'Authorization': `Bearer ${authData.token}` }
  });
  
  const posts = await postsRes.json();
  console.log(`Fetched ${posts.length} posts for IIT Delhi user.`);
  
  if (posts.length > 0) {
    const universities = [...new Set(posts.map(p => p.university))];
    console.log('Universities in feed:', universities);
    console.log('Top post authors:', posts.slice(0, 3).map(p => p.author.name));
  }
}

testFeed().catch(console.error);
