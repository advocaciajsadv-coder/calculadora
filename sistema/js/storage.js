/* ==========================================================================
   storage.js — Persistência local (localStorage + IndexedDB)
   Sistema Interno JS Advocacia. Tudo roda no navegador deste computador.
   ========================================================================== */

const DB = (() => {
  const LS_KEYS = {
    config: 'jsadv_config',
    clientes: 'jsadv_clientes',
    documentos: 'jsadv_documentos',
    audiencias: 'jsadv_audiencias',
  };

  const IDB_NAME = 'jsadv_db';
  const IDB_STORE = 'audios';
  let idbPromise = null;

  function openIdb() {
    if (idbPromise) return idbPromise;
    idbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return idbPromise;
  }

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

  // ---------------- Clientes ----------------
  function listClientes() {
    return readJSON(LS_KEYS.clientes, []);
  }

  function getCliente(id) {
    return listClientes().find((c) => c.id === id) || null;
  }

  function saveCliente(cliente) {
    const clientes = listClientes();
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

  function deleteCliente(id) {
    writeJSON(LS_KEYS.clientes, listClientes().filter((c) => c.id !== id));
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

  // ---------------- Audiências (metadados + transcrição em localStorage) ----------------
  function listAudiencias() {
    return readJSON(LS_KEYS.audiencias, []).sort((a, b) =>
      b.criadoEm.localeCompare(a.criadoEm)
    );
  }

  function saveAudiencia(item) {
    const items = readJSON(LS_KEYS.audiencias, []);
    item.id = item.id || uid();
    item.criadoEm = item.criadoEm || new Date().toISOString();
    const idx = items.findIndex((d) => d.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.push(item);
    writeJSON(LS_KEYS.audiencias, items);
    return item;
  }

  async function deleteAudiencia(id) {
    writeJSON(LS_KEYS.audiencias, readJSON(LS_KEYS.audiencias, []).filter((d) => d.id !== id));
    await deleteAudioBlob(id);
  }

  // ---------------- Áudio (blob binário) em IndexedDB ----------------
  async function saveAudioBlob(id, blob) {
    const db = await openIdb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(blob, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getAudioBlob(id) {
    const db = await openIdb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async function deleteAudioBlob(id) {
    const db = await openIdb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // ---------------- Backup (JSON dos dados de texto) ----------------
  function exportBackupJSON() {
    return JSON.stringify(
      {
        exportadoEm: new Date().toISOString(),
        config: getConfig(),
        clientes: listClientes(),
        documentos: readJSON(LS_KEYS.documentos, []),
        audiencias: readJSON(LS_KEYS.audiencias, []),
      },
      null,
      2
    );
  }

  function importBackupJSON(jsonStr) {
    const data = JSON.parse(jsonStr);
    if (data.config) writeJSON(LS_KEYS.config, data.config);
    if (data.clientes) writeJSON(LS_KEYS.clientes, data.clientes);
    if (data.documentos) writeJSON(LS_KEYS.documentos, data.documentos);
    if (data.audiencias) writeJSON(LS_KEYS.audiencias, data.audiencias);
  }

  return {
    uid,
    getConfig,
    saveConfig,
    listClientes,
    getCliente,
    saveCliente,
    deleteCliente,
    listDocumentos,
    saveDocumento,
    deleteDocumento,
    listAudiencias,
    saveAudiencia,
    deleteAudiencia,
    saveAudioBlob,
    getAudioBlob,
    deleteAudioBlob,
    exportBackupJSON,
    importBackupJSON,
  };
})();
