const http = require('http');
async function check() {
  const registerRes = await fetch('http://localhost:5001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'User ID Check',
      email: `useridcheck-${Date.now()}@example.com`,
      password: 'password123',
      university: 'Delhi University (DU)',
      year: '1'
    })
  });
  const authData = await registerRes.json();
  console.log("Auth Data Keys:", Object.keys(authData));
  console.log("Has _id:", !!authData._id);
  console.log("Has id:", !!authData.id);
  process.exit(0);
}
check().catch(console.error);
