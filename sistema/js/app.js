/* ==========================================================================
   app.js — Navegação (SPA), tela de acesso, painel e configurações
   ========================================================================== */

async function sha256Hex(text) {
  const enc = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ---------------- Tela de acesso (PIN) ----------------
async function initLock() {
  const cfg = DB.getConfig();
  if (!cfg.pinHash) {
    boot();
    return;
  }
  document.getElementById('lockScreen').style.display = 'flex';
  const input = document.getElementById('pinInput');
  const err = document.getElementById('pinError');

  async function tryUnlock() {
    const hash = await sha256Hex(input.value);
    if (hash === cfg.pinHash) {
      document.getElementById('lockScreen').style.display = 'none';
      boot();
    } else {
      err.textContent = 'PIN incorreto.';
      input.value = '';
      input.focus();
    }
  }

  document.getElementById('pinSubmit').onclick = tryUnlock;
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryUnlock(); });
}

// ---------------- Roteamento simples por hash ----------------
const VIEWS = ['painel', 'clientes', 'contratos', 'procuracoes', 'hipossuficiencia', 'recibos', 'propostas', 'historico', 'configuracoes'];

function navigateTo(view) {
  if (!VIEWS.includes(view)) view = 'painel';
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
  document.getElementById(`view-${view}`).classList.add('active');
  const navEl = document.querySelector(`.nav-item[data-view="${view}"]`);
  if (navEl) navEl.classList.add('active');

  if (view === 'painel') renderPainel();
  if (view === 'clientes') renderClientesView();
  if (view === 'contratos') Docs.renderContratosView();
  if (view === 'procuracoes') Docs.renderProcuracoesView();
  if (view === 'hipossuficiencia') Docs.renderHipossuficienciaView();
  if (view === 'recibos') Docs.renderRecibosView();
  if (view === 'propostas') Docs.renderPropostasView();
  if (view === 'historico') Docs.renderHistoricoView();
  if (view === 'configuracoes') renderConfigView();
}

function initRouter() {
  window.addEventListener('hashchange', () => {
    const view = location.hash.replace('#/', '') || 'painel';
    navigateTo(view);
  });
  const initial = location.hash.replace('#/', '') || 'painel';
  navigateTo(initial);
}

// ---------------- Painel ----------------
function renderPainel() {
  const docs = DB.listDocumentos();
  const porTipo = {};
  docs.forEach((d) => { porTipo[d.tipo] = (porTipo[d.tipo] || 0) + 1; });
  const stats = [
    { label: 'Documentos gerados', value: docs.length },
    { label: 'Último documento', value: docs[0] ? new Date(docs[0].criadoEm).toLocaleDateString('pt-BR') : '—' },
    { label: 'Tipos diferentes usados', value: Object.keys(porTipo).length },
  ];
  document.getElementById('painelStats').innerHTML = stats.map((s) => `
    <div class="card" style="text-align:center">
      <div style="font-family:'Playfair Display',serif;font-size:28px;color:var(--gold-light)">${s.value}</div>
      <div class="field-hint" style="margin-top:6px">${s.label}</div>
    </div>
  `).join('');
}

// ---------------- Clientes ----------------
function renderClientesView() {
  renderClientesTable();
  document.getElementById('clienteForm').onsubmit = (e) => {
    e.preventDefault();
    const cliente = {
      id: document.getElementById('cli-id').value || null,
      nome: document.getElementById('cli-nome').value.trim(),
      genero: document.getElementById('cli-genero').value,
      cpf: document.getElementById('cli-cpf').value.trim(),
      rg: document.getElementById('cli-rg').value.trim(),
      nascimento: document.getElementById('cli-nascimento').value,
      endereco: document.getElementById('cli-endereco').value.trim(),
      cep: document.getElementById('cli-cep').value.trim(),
      telefone: document.getElementById('cli-telefone').value.trim(),
      email: document.getElementById('cli-email').value.trim(),
    };
    if (!cliente.nome) return;
    DB.saveCliente(cliente);
    Docs.toast('Cliente salvo.');
    resetClienteForm();
    renderClientesTable();
  };
  document.getElementById('cli-cancel').onclick = resetClienteForm;
}

function resetClienteForm() {
  document.getElementById('clienteForm').reset();
  document.getElementById('cli-id').value = '';
  document.getElementById('clienteFormTitle').textContent = 'Novo cliente';
  document.getElementById('cli-cancel').style.display = 'none';
}

function renderClientesTable() {
  const wrap = document.getElementById('clientesTableWrap');
  const clientes = DB.listClientes();
  if (clientes.length === 0) {
    wrap.innerHTML = `<div class="empty-state">Nenhum cliente cadastrado ainda.</div>`;
    return;
  }
  wrap.innerHTML = `
    <table>
      <thead><tr><th>Nome</th><th>CPF</th><th>Telefone</th><th></th></tr></thead>
      <tbody>
        ${clientes.map((c) => `
          <tr>
            <td>${c.nome}</td>
            <td>${c.cpf || '—'}</td>
            <td>${c.telefone || '—'}</td>
            <td style="white-space:nowrap">
              <button class="btn btn-sm" data-cli-edit="${c.id}">Editar</button>
              <button class="btn btn-sm btn-danger" data-cli-del="${c.id}">Excluir</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  wrap.querySelectorAll('[data-cli-edit]').forEach((btn) => btn.onclick = () => {
    const c = DB.getCliente(btn.dataset.cliEdit);
    document.getElementById('cli-id').value = c.id;
    document.getElementById('cli-nome').value = c.nome || '';
    document.getElementById('cli-genero').value = c.genero || 'M';
    document.getElementById('cli-cpf').value = c.cpf || '';
    document.getElementById('cli-rg').value = c.rg || '';
    document.getElementById('cli-nascimento').value = c.nascimento || '';
    document.getElementById('cli-endereco').value = c.endereco || '';
    document.getElementById('cli-cep').value = c.cep || '';
    document.getElementById('cli-telefone').value = c.telefone || '';
    document.getElementById('cli-email').value = c.email || '';
    document.getElementById('clienteFormTitle').textContent = `Editando: ${c.nome}`;
    document.getElementById('cli-cancel').style.display = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  wrap.querySelectorAll('[data-cli-del]').forEach((btn) => btn.onclick = () => {
    if (confirm('Excluir este cliente?')) {
      DB.deleteCliente(btn.dataset.cliDel);
      renderClientesTable();
      Docs.toast('Cliente excluído.');
    }
  });
}

// ---------------- Configurações ----------------
function renderConfigView() {
  const cfg = DB.getConfig();
  document.getElementById('cfg-razaosocial').value = cfg.razaoSocial || '';
  document.getElementById('cfg-nome').value = cfg.nomeAdvogado || '';
  document.getElementById('cfg-estadocivil').value = cfg.estadoCivilAdvogada || '';
  document.getElementById('cfg-oab').value = cfg.oab || '';
  document.getElementById('cfg-oabnumero').value = cfg.oabNumero || '';
  document.getElementById('cfg-cnpj').value = cfg.cnpj || '';
  document.getElementById('cfg-endereco').value = cfg.endereco || '';
  document.getElementById('cfg-cidade').value = cfg.cidade || '';
  document.getElementById('cfg-uf').value = cfg.uf || '';
  document.getElementById('cfg-telefone').value = cfg.telefone || '';
  document.getElementById('cfg-email').value = cfg.email || '';

  document.getElementById('configForm').onsubmit = (e) => {
    e.preventDefault();
    const novo = {
      ...cfg,
      razaoSocial: document.getElementById('cfg-razaosocial').value.trim(),
      nomeAdvogado: document.getElementById('cfg-nome').value.trim(),
      estadoCivilAdvogada: document.getElementById('cfg-estadocivil').value.trim(),
      oab: document.getElementById('cfg-oab').value.trim(),
      oabNumero: document.getElementById('cfg-oabnumero').value.trim(),
      cnpj: document.getElementById('cfg-cnpj').value.trim(),
      endereco: document.getElementById('cfg-endereco').value.trim(),
      cidade: document.getElementById('cfg-cidade').value.trim(),
      uf: document.getElementById('cfg-uf').value.trim(),
      telefone: document.getElementById('cfg-telefone').value.trim(),
      email: document.getElementById('cfg-email').value.trim(),
    };
    DB.saveConfig(novo);
    Docs.toast('Dados do escritório salvos.');
  };

  document.getElementById('cfg-savePin').onclick = async () => {
    const pin = document.getElementById('cfg-pin').value;
    const confirm1 = document.getElementById('cfg-pinConfirm').value;
    if (!pin) { Docs.toast('Digite um PIN ou use "Remover PIN".'); return; }
    if (pin !== confirm1) { Docs.toast('Os PINs não conferem.'); return; }
    const cfgAtual = DB.getConfig();
    cfgAtual.pinHash = await sha256Hex(pin);
    DB.saveConfig(cfgAtual);
    document.getElementById('cfg-pin').value = '';
    document.getElementById('cfg-pinConfirm').value = '';
    Docs.toast('PIN definido.');
  };

  document.getElementById('cfg-removePin').onclick = () => {
    const cfgAtual = DB.getConfig();
    cfgAtual.pinHash = null;
    DB.saveConfig(cfgAtual);
    Docs.toast('PIN removido.');
  };

  document.getElementById('btn-exportBackup').onclick = () => {
    const json = DB.exportBackupJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-jsadvocacia-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  document.getElementById('btn-importBackup').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        DB.importBackupJSON(reader.result);
        Docs.toast('Backup importado com sucesso.');
        navigateTo('painel');
      } catch (err) {
        Docs.toast('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  };
}

// ---------------- Boot ----------------
function boot() {
  document.getElementById('app').style.display = 'flex';
  initRouter();
}

initLock();
