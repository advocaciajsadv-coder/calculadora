/* ==========================================================================
   audiencias.js — Gravação de áudio + transcrição ao vivo (Web Speech API)
   ========================================================================== */

const Audiencias = (() => {
  let mediaRecorder = null;
  let audioChunks = [];
  let recognition = null;
  let finalTranscript = '';
  let timerInterval = null;
  let secondsElapsed = 0;
  let stream = null;

  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

  function formatTimer(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  function populateClienteSelect() {
    const sel = document.getElementById('aud-cliente');
    const clientes = DB.listClientes();
    sel.innerHTML = `<option value="">—</option>` + clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
  }

  async function startRecording() {
    const liveBox = document.getElementById('aud-liveTranscript');
    finalTranscript = '';
    liveBox.textContent = '';

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      Docs.toast('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
      return;
    }

    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
    mediaRecorder.start();

    secondsElapsed = 0;
    document.getElementById('aud-timer').textContent = '00:00';
    timerInterval = setInterval(() => {
      secondsElapsed++;
      document.getElementById('aud-timer').textContent = formatTimer(secondsElapsed);
    }, 1000);

    document.getElementById('aud-start').style.display = 'none';
    document.getElementById('aud-stop').style.display = '';
    document.getElementById('aud-recIndicator').style.display = '';

    if (SpeechRecognitionAPI) {
      recognition = new SpeechRecognitionAPI();
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart + ' ';
          } else {
            interim += transcriptPart;
          }
        }
        liveBox.textContent = finalTranscript + interim;
        liveBox.scrollTop = liveBox.scrollHeight;
      };

      recognition.onerror = (e) => {
        console.warn('Reconhecimento de voz:', e.error);
      };

      recognition.onend = () => {
        // Reinicia automaticamente se a gravação ainda estiver ativa
        // (o serviço de reconhecimento do navegador encerra sozinho após alguns minutos de silêncio)
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          try { recognition.start(); } catch (e) { /* já iniciado */ }
        }
      };

      try {
        recognition.start();
        document.getElementById('aud-speechWarning').style.display = 'none';
      } catch (e) {
        document.getElementById('aud-speechWarning').style.display = '';
      }
    } else {
      document.getElementById('aud-speechWarning').style.display = '';
    }
  }

  function stopRecording() {
    return new Promise((resolve) => {
      clearInterval(timerInterval);
      document.getElementById('aud-start').style.display = '';
      document.getElementById('aud-stop').style.display = 'none';
      document.getElementById('aud-recIndicator').style.display = 'none';

      if (recognition) {
        recognition.onend = null;
        recognition.stop();
        recognition = null;
      }

      if (!mediaRecorder) return resolve(null);

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        if (stream) stream.getTracks().forEach((t) => t.stop());
        resolve(blob);
      };
      mediaRecorder.stop();
    });
  }

  async function handleStop() {
    const blob = await stopRecording();
    if (!blob) return;

    const titulo = document.getElementById('aud-titulo').value || `Audiência ${new Date().toLocaleString('pt-BR')}`;
    const clienteId = document.getElementById('aud-cliente').value || null;
    const cliente = clienteId ? DB.getCliente(clienteId) : null;

    const item = DB.saveAudiencia({
      titulo,
      clienteId,
      clienteNome: cliente ? cliente.nome : '',
      duracaoSegundos: secondsElapsed,
      transcricao: finalTranscript.trim(),
    });
    await DB.saveAudioBlob(item.id, blob);

    document.getElementById('aud-titulo').value = '';
    Docs.toast('Gravação salva.');
    renderAudienciasList();
  }

  function downloadTranscriptDoc(titulo, texto) {
    const html = `<h2>${titulo}</h2><p>${(texto || '(sem transcrição)').replace(/\n/g, '<br>')}</p>`;
    Docs.downloadAsWord(html, `Transcricao - ${titulo}`);
  }

  async function renderAudienciasList() {
    const wrap = document.getElementById('audienciasListWrap');
    const items = DB.listAudiencias();
    if (items.length === 0) {
      wrap.innerHTML = `<div class="empty-state">Nenhuma gravação ainda.</div>`;
      return;
    }
    wrap.innerHTML = items.map((item) => `
      <div class="card" style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
          <div>
            <strong>${item.titulo}</strong><br>
            <span class="field-hint">${item.clienteNome ? item.clienteNome + ' · ' : ''}${new Date(item.criadoEm).toLocaleString('pt-BR')} · duração ${formatTimer(item.duracaoSegundos || 0)}</span>
          </div>
          <div class="btn-row" style="margin:0">
            <button class="btn btn-sm" data-aud-audio="${item.id}">Carregar áudio</button>
            <button class="btn btn-sm" data-aud-doc="${item.id}">Baixar transcrição (.doc)</button>
            <button class="btn btn-sm btn-danger" data-aud-del="${item.id}">Excluir</button>
          </div>
        </div>
        <div id="audio-wrap-${item.id}"></div>
        <div class="field" style="margin-top:12px">
          <label>Transcrição (editável)</label>
          <textarea class="transcript-box" style="width:100%" data-aud-transcript="${item.id}" rows="5">${item.transcricao || ''}</textarea>
        </div>
        <div class="btn-row"><button class="btn btn-sm btn-primary" data-aud-savetranscript="${item.id}">Salvar edição da transcrição</button></div>
      </div>
    `).join('');

    wrap.querySelectorAll('[data-aud-audio]').forEach((btn) => {
      btn.onclick = async () => {
        const id = btn.dataset.audAudio;
        const blob = await DB.getAudioBlob(id);
        const target = document.getElementById(`audio-wrap-${id}`);
        if (!blob) {
          target.innerHTML = `<p class="field-hint">Áudio não encontrado (pode ter sido removido).</p>`;
          return;
        }
        const url = URL.createObjectURL(blob);
        target.innerHTML = `<audio controls src="${url}"></audio><div class="btn-row"><a class="btn btn-sm" href="${url}" download="audiencia-${id}.webm">Baixar áudio (.webm)</a></div>`;
      };
    });

    wrap.querySelectorAll('[data-aud-doc]').forEach((btn) => {
      btn.onclick = () => {
        const item = items.find((i) => i.id === btn.dataset.audDoc);
        downloadTranscriptDoc(item.titulo, item.transcricao);
      };
    });

    wrap.querySelectorAll('[data-aud-savetranscript]').forEach((btn) => {
      btn.onclick = () => {
        const id = btn.dataset.audSavetranscript;
        const item = items.find((i) => i.id === id);
        const texto = document.querySelector(`[data-aud-transcript="${id}"]`).value;
        item.transcricao = texto;
        DB.saveAudiencia(item);
        Docs.toast('Transcrição atualizada.');
      };
    });

    wrap.querySelectorAll('[data-aud-del]').forEach((btn) => {
      btn.onclick = async () => {
        if (confirm('Excluir esta gravação e sua transcrição?')) {
          await DB.deleteAudiencia(btn.dataset.audDel);
          renderAudienciasList();
          Docs.toast('Gravação excluída.');
        }
      };
    });
  }

  function init() {
    populateClienteSelect();
    renderAudienciasList();
    document.getElementById('aud-start').onclick = startRecording;
    document.getElementById('aud-stop').onclick = handleStop;
    if (!SpeechRecognitionAPI) {
      document.getElementById('aud-speechWarning').style.display = '';
    }
  }

  return { init, populateClienteSelect, renderAudienciasList };
})();
