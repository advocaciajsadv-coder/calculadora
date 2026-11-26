import { jwtVerify } from 'jose';

function getCookie(request, name) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default async function handler(request) {
  const token = getCookie(request, 'sessao');
  if (!token) {
    return new Response(JSON.stringify({ autenticado: false }), { status: 401 });
  }
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return new Response(
      JSON.stringify({ autenticado: true, usuario: payload.usuario, nome: payload.nome, papel: payload.papel }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(JSON.stringify({ autenticado: false }), { status: 401 });
  }
}
