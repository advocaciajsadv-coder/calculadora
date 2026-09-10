/* ==========================================================================
   storage.js — Persistência local (localStorage)
   Gerador de documentos JS Advocacia. Roda só neste navegador.
   ========================================================================== */

const DB = (() => {
  const LS_KEYS = {
    config: 'jsadv_config',
    documentos: 'jsadv_documentos',
    clientes: 'jsadv_clientes',
  };

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error('Erro lendo', key, e);
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }

  // ---------------- Config do escritório ----------------
  function getConfig() {
    return readJSON(LS_KEYS.config, {
      razaoSocial: 'JACKELINE SANTOS SOCIEDADE INDIVIDUAL DE ADVOCACIA',
      nomeAdvogado: 'Jackeline Santos Lima de Almeida',
      estadoCivilAdvogada: 'casada',
      oab: 'OAB/GO 55.192 | OAB/DF 85.368',
      oabNumero: '55.192',
      cnpj: '57.393.265/0001-14',
      endereco: 'Av. Presidente Kenedy, Qd 19, Lote 05, Jardim Alexandrina, sala 3, Anápolis-GO',
      cidade: 'Anápolis',
      uf: 'GO',
      telefone: '(62) 98556-6018',
      email: 'advocacia.js.adv@gmail.com',
      pinHash: null,
    });
  }

  function saveConfig(cfg) {
    writeJSON(LS_KEYS.config, cfg);
  }

  // ---------------- Documentos gerados (histórico) ----------------
  function listDocumentos() {
    return readJSON(LS_KEYS.documentos, []).sort((a, b) =>
      b.criadoEm.localeCompare(a.criadoEm)
    );
  }

  function saveDocumento(doc) {
    const docs = readJSON(LS_KEYS.documentos, []);
    doc.id = doc.id || uid();
    doc.criadoEm = doc.criadoEm || new Date().toISOString();
    const idx = docs.findIndex((d) => d.id === doc.id);
    if (idx >= 0) docs[idx] = doc;
    else docs.push(doc);
    writeJSON(LS_KEYS.documentos, docs);
    return doc;
  }

  function deleteDocumento(id) {
    writeJSON(LS_KEYS.documentos, readJSON(LS_KEYS.documentos, []).filter((d) => d.id !== id));
  }

  // ---------------- Clientes (cadastro local, opcional) ----------------
  function listClientes() {
    return readJSON(LS_KEYS.clientes, []).sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
  }

  function getCliente(id) {
    return readJSON(LS_KEYS.clientes, []).find((c) => c.id === id) || null;
  }

  function saveCliente(cliente) {
    const clientes = readJSON(LS_KEYS.clientes, []);
    if (cliente.id) {
      const idx = clientes.findIndex((c) => c.id === cliente.id);
      if (idx >= 0) clientes[idx] = cliente;
      else clientes.push(cliente);
    } else {
      cliente.id = uid();
      cliente.criadoEm = new Date().toISOString();
      clientes.push(cliente);
    }
    writeJSON(LS_KEYS.clientes, clientes);
    return cliente;
  }

  // items: array de clientes no mesmo formato de saveCliente — usado para
  // importar em lote (ex: uma exportação vinda do Tramitação Inteligente).
  function importClientes(items) {
    const clientes = readJSON(LS_KEYS.clientes, []);
    items.forEach((item) => {
      item.id = item.id || uid();
      item.criadoEm = item.criadoEm || new Date().toISOString();
      const idx = clientes.findIndex((c) => c.id === item.id);
      if (idx >= 0) clientes[idx] = item;
      else clientes.push(item);
    });
    writeJSON(LS_KEYS.clientes, clientes);
  }

  function deleteCliente(id) {
    writeJSON(LS_KEYS.clientes, readJSON(LS_KEYS.clientes, []).filter((c) => c.id !== id));
  }

  // ---------------- Backup (JSON) ----------------
  function exportBackupJSON() {
    return JSON.stringify(
      {
        exportadoEm: new Date().toISOString(),
        config: getConfig(),
        documentos: readJSON(LS_KEYS.documentos, []),
        clientes: readJSON(LS_KEYS.clientes, []),
      },
      null,
      2
    );
  }

  function importBackupJSON(jsonStr) {
    const data = JSON.parse(jsonStr);
    if (data.config) writeJSON(LS_KEYS.config, data.config);
    if (data.documentos) writeJSON(LS_KEYS.documentos, data.documentos);
    if (data.clientes) writeJSON(LS_KEYS.clientes, data.clientes);
  }

  return {
    uid,
    getConfig,
    saveConfig,
    listDocumentos,
    saveDocumento,
    deleteDocumento,
    listClientes,
    getCliente,
    saveCliente,
    importClientes,
    deleteCliente,
    exportBackupJSON,
    importBackupJSON,
  };
})();
