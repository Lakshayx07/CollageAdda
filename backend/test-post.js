async function testPost() {
  const registerRes = await fetch('http://localhost:5001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Poster',
      email: `poster${Date.now()}@example.com`,
      password: 'password123',
      university: 'Delhi University (DU)',
      year: '1'
    })
  });
  
  const authData = await registerRes.json();
  if (!authData.token) return console.log('Failed to register:', authData);
  
  const postRes = await fetch('http://localhost:5001/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authData.token}` },
    body: JSON.stringify({ content: 'Hello from DU! This is a test post to check cross-university visibility.' })
  });
  
  console.log('Post created:', await postRes.json());
}
testPost().catch(console.error);
