import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ erro: 'Método não permitido' }), { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ erro: 'Dados inválidos' }), { status: 400 });
  }

  const usuario = (body && body.usuario ? String(body.usuario) : '').trim().toLowerCase();
  const senha = body && body.senha ? String(body.senha) : '';

  if (!usuario || !senha) {
    return new Response(JSON.stringify({ erro: 'Informe usuário e senha' }), { status: 400 });
  }

  let usuarios;
  try {
    usuarios = JSON.parse(process.env.USERS_JSON || '{}');
  } catch {
    usuarios = {};
  }

  const registro = usuarios[usuario];
  const senhaOk = registro ? bcrypt.compareSync(senha, registro.senhaHash) : false;

  if (!registro || !senhaOk) {
    return new Response(JSON.stringify({ erro: 'Usuário ou senha incorretos' }), { status: 401 });
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({ usuario, nome: registro.nome, papel: registro.papel })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);

  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.append(
    'Set-Cookie',
    `sessao=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
  );

  return new Response(JSON.stringify({ ok: true, nome: registro.nome, papel: registro.papel }), {
    status: 200,
    headers,
  });
}
