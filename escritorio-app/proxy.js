import { next } from '@vercel/functions';
import { jwtVerify } from 'jose';

export const config = {
  matcher: ['/sistema.html'],
};

function getCookie(request, name) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default async function proxy(request) {
  const token = getCookie(request, 'sessao');

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return next();
    } catch (e) {
      // token inválido/expirado — cai para o redirecionamento abaixo
    }
  }

  const url = new URL(request.url);
  const loginUrl = new URL('/login.html', url);
  loginUrl.searchParams.set('redirect', url.pathname);
  return Response.redirect(loginUrl, 302);
}
