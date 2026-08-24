/* ==========================================================================
   storage.js — Persistência local (localStorage)
   Gerador de documentos JS Advocacia. Roda só neste navegador.
   ========================================================================== */

const DB = (() => {
  const LS_KEYS = {
    config: 'jsadv_config',
    documentos: 'jsadv_documentos',
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
      nomeAdvogado: 'Jackeline Santos Lima de Almeida',
      oab: 'OAB/GO 55.192 | OAB/DF 85.368',
      cnpj: '57.393.265/0001-14',
      endereco: '',
      cidade: 'Anápolis',
      uf: 'GO',
      telefone: '(62) 9 8556-6018',
      email: '',
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

  // ---------------- Backup (JSON) ----------------
  function exportBackupJSON() {
    return JSON.stringify(
      {
        exportadoEm: new Date().toISOString(),
        config: getConfig(),
        documentos: readJSON(LS_KEYS.documentos, []),
      },
      null,
      2
    );
  }

  function importBackupJSON(jsonStr) {
    const data = JSON.parse(jsonStr);
    if (data.config) writeJSON(LS_KEYS.config, data.config);
    if (data.documentos) writeJSON(LS_KEYS.documentos, data.documentos);
  }

  return {
    uid,
    getConfig,
    saveConfig,
    listDocumentos,
    saveDocumento,
    deleteDocumento,
    exportBackupJSON,
    importBackupJSON,
  };
})();
