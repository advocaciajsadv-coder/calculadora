import { neon } from '@neondatabase/serverless';
import { jwtVerify } from 'jose';

function getCookie(request, name) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function autenticado(request) {
  const token = getCookie(request, 'sessao');
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

function sql() {
  const url =
    process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_UNPOOLED;
  return neon(url);
}

let tabelaPronta = false;
async function garantirTabela(db) {
  if (tabelaPronta) return;
  await db`
    CREATE TABLE IF NOT EXISTS registros (
      colecao text NOT NULL,
      id text NOT NULL,
      dados jsonb NOT NULL,
      atualizado_em timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (colecao, id)
    )
  `;
  tabelaPronta = true;
}

function json(dados, status = 200) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(request) {
  if (!(await autenticado(request))) return json({ erro: 'Não autenticado' }, 401);
  const url = new URL(request.url);
  const colecao = url.searchParams.get('colecao');
  const id = url.searchParams.get('id');
  if (!colecao) return json({ erro: 'Informe a coleção' }, 400);

  const db = sql();
  await garantirTabela(db);

  if (id) {
    const linhas = await db`SELECT dados FROM registros WHERE colecao = ${colecao} AND id = ${id} LIMIT 1`;
    return json(linhas[0] ? linhas[0].dados : null);
  }
  const linhas = await db`SELECT id, dados FROM registros WHERE colecao = ${colecao} ORDER BY atualizado_em ASC`;
  return json(linhas.map((l) => ({ id: l.id, ...l.dados })));
}

export async function POST(request) {
  if (!(await autenticado(request))) return json({ erro: 'Não autenticado' }, 401);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ erro: 'Dados inválidos' }, 400);
  }
  const { colecao, dados } = body || {};
  if (!colecao || !dados) return json({ erro: 'Informe coleção e dados' }, 400);

  const db = sql();
  await garantirTabela(db);
  const id = crypto.randomUUID();
  await db`INSERT INTO registros (colecao, id, dados) VALUES (${colecao}, ${id}, ${JSON.stringify(dados)}::jsonb)`;
  return json({ id });
}

export async function PUT(request) {
  if (!(await autenticado(request))) return json({ erro: 'Não autenticado' }, 401);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ erro: 'Dados inválidos' }, 400);
  }
  const { colecao, id, dados } = body || {};
  if (!colecao || !id || !dados) return json({ erro: 'Informe coleção, id e dados' }, 400);

  const db = sql();
  await garantirTabela(db);
  await db`
    INSERT INTO registros (colecao, id, dados, atualizado_em)
    VALUES (${colecao}, ${id}, ${JSON.stringify(dados)}::jsonb, now())
    ON CONFLICT (colecao, id) DO UPDATE SET dados = ${JSON.stringify(dados)}::jsonb, atualizado_em = now()
  `;
  return json({ ok: true });
}

export async function PATCH(request) {
  if (!(await autenticado(request))) return json({ erro: 'Não autenticado' }, 401);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ erro: 'Dados inválidos' }, 400);
  }
  const { colecao, id, patch } = body || {};
  if (!colecao || !id || !patch) return json({ erro: 'Informe coleção, id e patch' }, 400);

  const db = sql();
  await garantirTabela(db);
  const linhas = await db`SELECT dados FROM registros WHERE colecao = ${colecao} AND id = ${id} LIMIT 1`;
  const atual = linhas[0] ? linhas[0].dados : {};
  const novo = Object.assign({}, atual, patch);
  await db`
    INSERT INTO registros (colecao, id, dados, atualizado_em)
    VALUES (${colecao}, ${id}, ${JSON.stringify(novo)}::jsonb, now())
    ON CONFLICT (colecao, id) DO UPDATE SET dados = ${JSON.stringify(novo)}::jsonb, atualizado_em = now()
  `;
  return json({ ok: true });
}

export async function DELETE(request) {
  if (!(await autenticado(request))) return json({ erro: 'Não autenticado' }, 401);
  const url = new URL(request.url);
  const colecao = url.searchParams.get('colecao');
  const id = url.searchParams.get('id');
  if (!colecao || !id) return json({ erro: 'Informe coleção e id' }, 400);

  const db = sql();
  await garantirTabela(db);
  await db`DELETE FROM registros WHERE colecao = ${colecao} AND id = ${id}`;
  return json({ ok: true });
}
