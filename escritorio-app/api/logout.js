export async function POST() {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.append('Set-Cookie', 'sessao=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
