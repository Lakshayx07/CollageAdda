export async function GET() {
  return new Response('google-site-verification: google4736c4d1c2c1ea28.html', {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
