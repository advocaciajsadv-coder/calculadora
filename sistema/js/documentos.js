/* ==========================================================================
   documentos.js — Geradores de documentos (contrato, procuração,
   declaração de hipossuficiência, recibo, proposta de honorários)
   Contrato, Procuração e Hipossuficiência seguem a redação real
   fornecida pelo escritório (modelo trabalhista). Os dados do cliente
   são digitados direto em cada formulário.
   ========================================================================== */

const Docs = (() => {

  // URL absoluta do timbrado — necessário para o .doc exportado, que é
  // aberto fora do navegador e não resolveria um caminho relativo.
  const LOGO_BASE = 'https://advocaciajsadv-coder.github.io/calculadora/sistema/img/';

  // ---------------- Valor por extenso (R$) ----------------
  const UNI = ['zero','um','dois','três','quatro','cinco','seis','sete','oito','nove'];
  const DEZ10 = ['dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
  const DEZ = ['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
  const CEM = ['','cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];
  const MES_ABREV = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

  function grupoExtenso(n) {
    if (n === 0) return '';
    if (n === 100) return 'cem';
    let partes = [];
    const c = Math.floor(n / 100);
    const resto = n % 100;
    if (c > 0) partes.push(CEM[c]);
    if (resto > 0) {
      if (resto < 10) partes.push(UNI[resto]);
      else if (resto < 20) partes.push(DEZ10[resto - 10]);
      else {
        const d = Math.floor(resto / 10);
        const u = resto % 10;
        partes.push(DEZ[d] + (u > 0 ? ' e ' + UNI[u] : ''));
      }
    }
    return partes.join(' e ');
  }

  function inteiroExtenso(n) {
    if (n === 0) return 'zero';
    const milhoes = Math.floor(n / 1000000);
    const milhares = Math.floor((n % 1000000) / 1000);
    const centenas = n % 1000;
    let partes = [];
    if (milhoes > 0) partes.push((milhoes === 1 ? 'um milhão' : grupoExtenso(milhoes) + ' milhões'));
    if (milhares > 0) partes.push((milhares === 1 ? 'mil' : grupoExtenso(milhares) + ' mil'));
    if (centenas > 0) partes.push(grupoExtenso(centenas));
    return partes.join(' e ');
  }

  function valorExtenso(valor) {
    valor = Math.round((Number(valor) || 0) * 100) / 100;
    const inteiro = Math.floor(valor);
    const centavos = Math.round((valor - inteiro) * 100);
    let texto = inteiroExtenso(inteiro) + (inteiro === 1 ? ' real' : ' reais');
    if (centavos > 0) {
      texto += ' e ' + inteiroExtenso(centavos) + (centavos === 1 ? ' centavo' : ' centavos');
    }
    return texto;
  }

  function percentualExtenso(p) {
    return grupoExtenso(Math.round(Number(p) || 0)) || 'zero';
  }

  function formatBRL(v) {
    return (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatDateBR(isoDate) {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  }

  // Data por extenso completa (usada em Recibo e Proposta): "Anápolis/GO, 5 de março de 2026"
  function dataExtensoFromInput(isoDate) {
    const cfg = DB.getConfig();
    const cidade = cfg.cidade || 'Anápolis';
    const uf = cfg.uf || 'GO';
    let d, m, y;
    if (!isoDate) {
      const hoje = new Date();
      d = hoje.getDate(); m = hoje.getMonth() + 1; y = hoje.getFullYear();
    } else {
      [y, m, d] = isoDate.split('-').map(Number);
    }
    const mesNome = new Date(y, m - 1, d).toLocaleDateString('pt-BR', { month: 'long' });
    return `${cidade}/${uf}, ${d} de ${mesNome} de ${y}`;
  }

  // Data abreviada, no padrão real do escritório: "Anápolis-GO, 21 de ago. de 2026"
  function localDataAbreviada(isoDate) {
    const cfg = DB.getConfig();
    const cidade = cfg.cidade || 'Anápolis';
    const uf = cfg.uf || 'GO';
    let d, m, y;
    if (!isoDate) {
      const hoje = new Date();
      d = hoje.getDate(); m = hoje.getMonth() + 1; y = hoje.getFullYear();
    } else {
      [y, m, d] = isoDate.split('-').map(Number);
    }
    return `${cidade}-${uf}, ${d} de ${MES_ABREV[m - 1]}. de ${y}`;
  }

  // Concordância de gênero: g(cliente.genero, 'masculino', 'feminino')
  function g(genero, masc, fem) {
    return genero === 'F' ? fem : masc;
  }

  // ---------------- Campos de cliente (digitados direto no formulário) ----------------
  // "full": nome, gênero, CPF, RG, nascimento, endereço, CEP — usado em
  // Contrato, Procuração e Declaração (segue o modelo real do escritório).
  // "compact": só nome e CPF — usado em Recibo, mais simples.
  function clienteFieldsHtml(prefix, opts) {
    opts = opts || {};
    const selectHtml = `<div class="field span-full"><label>Carregar cliente salvo (opcional)</label><select id="${prefix}-clienteSelect"><option value="">— digitar manualmente —</option></select></div>`;
    if (opts.compact) {
      return selectHtml + `
        <div class="field span-2"><label>Nome completo do cliente</label><input id="${prefix}-nome" placeholder="Nome completo"></div>
        <div class="field"><label>CPF</label><input id="${prefix}-cpf" placeholder="000.000.000-00"></div>
      `;
    }
    return selectHtml + `
      <div class="field span-2"><label>Nome completo do cliente</label><input id="${prefix}-nome" placeholder="Nome completo"></div>
      <div class="field"><label>Gênero</label>
        <select id="${prefix}-genero"><option value="M">Masculino</option><option value="F">Feminino</option></select>
      </div>
      <div class="field"><label>CPF</label><input id="${prefix}-cpf" placeholder="000.000.000-00"></div>
      <div class="field"><label>RG</label><input id="${prefix}-rg" placeholder="0000000 SSP/UF"></div>
      <div class="field"><label>Data de nascimento</label><input type="date" id="${prefix}-nascimento"></div>
      <div class="field span-2"><label>Endereço completo</label><input id="${prefix}-endereco" placeholder="Rua, número, bairro, cidade, UF"></div>
      <div class="field"><label>CEP</label><input id="${prefix}-cep" placeholder="00000-000"></div>
    `;
  }

  // Preenche o <select> "Carregar cliente salvo" e liga o autopreenchimento
  // dos demais campos ao escolher um cliente cadastrado em Clientes.
  function populateClienteSelect(prefix) {
    const sel = document.getElementById(`${prefix}-clienteSelect`);
    if (!sel) return;
    const clientes = DB.listClientes();
    sel.innerHTML = `<option value="">— digitar manualmente —</option>` +
      clientes.map((c) => `<option value="${c.id}">${c.nome}</option>`).join('');
    sel.onchange = () => {
      const c = DB.getCliente(sel.value);
      if (!c) return;
      const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
      setVal(`${prefix}-nome`, c.nome);
      setVal(`${prefix}-cpf`, c.cpf);
      const generoEl = document.getElementById(`${prefix}-genero`);
      if (generoEl) generoEl.value = c.genero || 'M';
      setVal(`${prefix}-rg`, c.rg);
      setVal(`${prefix}-nascimento`, c.nascimento);
      setVal(`${prefix}-endereco`, c.endereco);
      setVal(`${prefix}-cep`, c.cep);
    };
  }

  function readClienteFromInputs(prefix, opts) {
    opts = opts || {};
    const val = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };
    const c = {
      nome: val(`${prefix}-nome`),
      cpf: val(`${prefix}-cpf`),
    };
    if (!opts.compact) {
      c.genero = document.getElementById(`${prefix}-genero`) ? document.getElementById(`${prefix}-genero`).value : 'M';
      c.rg = val(`${prefix}-rg`);
      c.nascimento = val(`${prefix}-nascimento`);
      c.endereco = val(`${prefix}-endereco`);
      c.cep = val(`${prefix}-cep`);
    }
    return c;
  }

  // Qualificação do cliente no padrão real do escritório:
  // "FULANO, brasileiro, titular do CPF n. ..., portador do RG n. ...,
  //  nascido em ..., residente e domiciliado à ..., CEP ..."
  function qualificacaoCliente(c) {
    if (!c || !c.nome) return '[dados do cliente não preenchidos]';
    const nasc = c.nascimento ? formatDateBR(c.nascimento) : '[data de nascimento]';
    return `<strong>${c.nome.toUpperCase()}</strong>, ${g(c.genero, 'brasileiro', 'brasileira')}, titular do CPF n. ${c.cpf || '[CPF]'}, portador${g(c.genero, '', 'a')} do RG n. ${c.rg || '[RG]'}, nascid${g(c.genero, 'o', 'a')} em ${nasc}, residente e domiciliad${g(c.genero, 'o', 'a')} à ${c.endereco || '[endereço]'}, CEP ${c.cep || '[CEP]'}`;
  }

  function assinaturaBloco(nomeLinha1, nomeLinha2) {
    return `
      <div class="assinaturas">
        <div class="linha-assinatura">
          <div class="linha"></div>
          ${nomeLinha1}
        </div>
        ${nomeLinha2 ? `<div class="linha-assinatura"><div class="linha"></div>${nomeLinha2}</div>` : ''}
      </div>
    `;
  }

  // ---------------- Timbrado ----------------
  function letterheadTop() {
    return `<img src="${LOGO_BASE}timbrado-topo.png" alt="" style="display:block;width:100%;max-width:680px;margin:0 auto 6px;">`;
  }

  function letterheadBottom() {
    return `<img src="${LOGO_BASE}timbrado-rodape.png" alt="" style="display:block;width:100%;max-width:680px;margin:20px auto 0;">`;
  }

  function previewWrapHtml(previewId, opts) {
    opts = opts || {};
    const top = opts.timbrado ? `<img class="doc-letterhead-top" src="img/timbrado-topo.png" alt="">` : '';
    const bottom = opts.timbrado ? `<img class="doc-letterhead-bottom" src="img/timbrado-rodape.png" alt="">` : '';
    return `
      <div class="doc-preview-wrap">
        ${top}
        <div class="doc-preview" id="${previewId}" contenteditable="true">Preencha os dados acima e clique em "Gerar / Atualizar documento".</div>
        ${bottom}
      </div>
    `;
  }

  // ---------------- Exportar / Imprimir ----------------
  function downloadAsWord(innerHtml, filename, opts) {
    opts = opts || {};
    const bodyHtml = opts.timbrado ? `${letterheadTop()}${innerHtml}${letterheadBottom()}` : innerHtml;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.7;color:#1a1a1a;padding:20px 60px 40px}
      h2{text-align:center;font-size:16px;letter-spacing:1px;text-transform:uppercase;margin-bottom:22px}
      p{margin-bottom:14px;text-align:justify}
      .clausula-titulo{font-weight:bold;margin-top:18px}
      .assinaturas{margin-top:60px}
      .linha-assinatura{margin-top:46px;text-align:center}
      .linha-assinatura .linha{border-top:1px solid #333;width:320px;margin:0 auto 6px}
      .data-local{margin-top:34px;text-align:right}
      </style></head><body>${bodyHtml}</body></html>`;
    const blob = new Blob(['﻿', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.doc') ? filename : filename + '.doc';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  function printHtml(innerHtml, opts) {
    opts = opts || {};
    const area = document.getElementById('printArea');
    area.innerHTML = opts.timbrado ? `${letterheadTop()}${innerHtml}${letterheadBottom()}` : innerHtml;
    window.print();
  }

  function condicoesHonorarios(modalidade, valorFixo, percentual, pagamentoTexto) {
    const vf = formatBRL(valorFixo);
    const vfExt = valorExtenso(valorFixo);
    switch (modalidade) {
      case 'fixo':
        return `As partes ajustam honorários advocatícios no valor fixo de ${vf} (${vfExt}).`;
      case 'exito':
        return `As partes ajustam honorários advocatícios de êxito, correspondentes a ${percentual}% (${percentual} por cento) sobre o proveito econômico efetivamente obtido ao final da demanda, a ser pago em até 5 (cinco) dias úteis do recebimento dos valores pelo CONTRATANTE.`;
      case 'misto':
        return `As partes ajustam honorários advocatícios iniciais no valor de ${vf} (${vfExt}), acrescidos de honorários de êxito correspondentes a ${percentual}% (${percentual} por cento) sobre o proveito econômico efetivamente obtido ao final da demanda.`;
      case 'mensal':
        return `As partes ajustam honorários advocatícios mensais no valor de ${vf} (${vfExt}) por mês, devidos enquanto vigente a presente prestação de serviços, sem prejuízo de honorários de sucumbência eventualmente arbitrados judicialmente.`;
      default:
        return pagamentoTexto || '';
    }
  }

  function saveHistorico(tipo, titulo, clienteNome, html) {
    return DB.saveDocumento({ tipo, titulo, clienteNome: clienteNome || '', conteudoHtml: html });
  }

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2600);
  }

  function actionButtonsHtml(prefix) {
    return `
      <div class="btn-row">
        <button type="button" class="btn btn-primary" id="${prefix}-gerar">Gerar / Atualizar documento</button>
        <button type="button" class="btn" id="${prefix}-baixar">Baixar .doc (Word)</button>
        <button type="button" class="btn" id="${prefix}-imprimir">Imprimir / Salvar PDF</button>
        <button type="button" class="btn" id="${prefix}-salvar">Salvar no histórico</button>
      </div>
      <p class="field-hint" style="margin-top:10px">O texto abaixo é editável — ajuste como quiser antes de baixar ou imprimir. Clicar em "Gerar / Atualizar documento" novamente substitui o texto pelos dados do formulário.</p>
    `;
  }

  function wireActionButtons(prefix, previewElId, filenameFn, opts) {
    document.getElementById(`${prefix}-baixar`).onclick = () => {
      downloadAsWord(document.getElementById(previewElId).innerHTML, filenameFn(), opts);
    };
    document.getElementById(`${prefix}-imprimir`).onclick = () => {
      printHtml(document.getElementById(previewElId).innerHTML, opts);
    };
  }

  // ================= CONTRATOS =================
  function renderContratosView() {
    const el = document.getElementById('view-contratos');
    el.innerHTML = `
      <div class="view-header"><h2>Contrato de Honorários Advocatícios</h2><p>Modelo trabalhista do escritório, com timbrado.</p></div>
      <div class="card">
        <h3>Dados do contrato</h3>
        <div class="grid cols-3">
          ${clienteFieldsHtml('ctr')}
          <div class="field span-2"><label>Tipo de ação</label><input id="ctr-tipoacao" value="Reclamação Trabalhista"></div>
          <div class="field"><label>Foro / Comarca</label><input id="ctr-foro" placeholder="Ex: Anápolis/GO"></div>
          <div class="field"><label>Honorários (%)</label><input type="number" step="0.01" id="ctr-percentual" value="30"></div>
          <div class="field"><label>Honorários recursais (%)</label><input type="number" step="0.01" id="ctr-percentualrecursal" value="35"></div>
          <div class="field"><label>Honorários mínimos p/ desistência (R$)</label><input type="number" step="0.01" id="ctr-valorminimo" value="2500"></div>
          <div class="field"><label>Data do contrato</label><input type="date" id="ctr-data"></div>
        </div>
        ${actionButtonsHtml('ctr')}
      </div>
      <div class="card">
        <h3>Prévia do documento</h3>
        ${previewWrapHtml('ctr-preview', { timbrado: true })}
      </div>
    `;
    document.getElementById('ctr-data').value = new Date().toISOString().slice(0, 10);
    document.getElementById('ctr-foro').value = `${DB.getConfig().cidade}/${DB.getConfig().uf}`;
    populateClienteSelect('ctr');

    document.getElementById('ctr-gerar').onclick = () => {
      const cliente = readClienteFromInputs('ctr');
      const cfg = DB.getConfig();
      const tipoAcao = document.getElementById('ctr-tipoacao').value || 'Reclamação Trabalhista';
      const foro = document.getElementById('ctr-foro').value || `${cfg.cidade}/${cfg.uf}`;
      const percentual = document.getElementById('ctr-percentual').value || '30';
      const percentualRecursal = document.getElementById('ctr-percentualrecursal').value || '35';
      const valorMinimo = document.getElementById('ctr-valorminimo').value || '2500';
      const data = document.getElementById('ctr-data').value;

      const html = `
        <h2>Contrato de Prestação de Serviços Advocatícios</h2>
        <p>Pelo presente instrumento particular, ${cfg.razaoSocial}, pessoa jurídica, inscrita sobre o CNPJ: ${cfg.cnpj}, neste ato representada por ${cfg.nomeAdvogado.toUpperCase()}, brasileira, ${cfg.estadoCivilAdvogada}, advogada, devidamente inscrita nos quadros da OAB-GO sob o n° ${cfg.oabNumero}, com endereço profissional, ${cfg.endereco}, e endereço eletrônico ${cfg.email}, Telefone: ${cfg.telefone}, denominado CONTRATADO (a), e de outro lado a CONTRATANTE, ${qualificacaoCliente(cliente)}.</p>
        <p class="clausula-titulo">CLÁUSULA PRIMEIRA – DO OBJETO</p>
        <p>O presente contrato tem por objeto a prestação de serviços advocatícios pelo CONTRATADO, consistentes na propositura e acompanhamento de ${tipoAcao}.</p>
        <p class="clausula-titulo">CLÁUSULA SEGUNDA – DOS HONORÁRIOS</p>
        <p>Pelos serviços profissionais prestados, a CONTRATANTE pagará ao CONTRATADO honorários advocatícios equivalentes a ${percentual}% (${percentualExtenso(percentual)} por cento) sobre o valor bruto que vier a receber, seja por meio de acordo, sentença judicial ou qualquer outro meio de recebimento de todo valor recebido por meio da ação, inclusive:</p>
        <ul><li>Valores relativos ao FGTS;</li><li>Quantias recebidas judicial ou extrajudicialmente.</li></ul>
        <p>Parágrafo Primeiro: Caso haja necessidade de interposição de recurso ou apresentação de contrarrazões em instâncias superiores, será mantido os honorários de ${percentualRecursal}% (${percentualExtenso(percentualRecursal)} por cento) sobre o valor obtido em decorrência desses atos.</p>
        <p class="clausula-titulo">CLÁUSULA TERCEIRA – DA DESISTÊNCIA</p>
        <p>Caso a CONTRATANTE desista da ação ou não compareça em audiência, pagará ao CONTRATADO honorários mínimos no valor de ${formatBRL(valorMinimo)} (${valorExtenso(valorMinimo)}), independentemente do estágio processual.</p>
        <p class="clausula-titulo">CLÁUSULA QUARTA – DAS DESPESAS</p>
        <p>As eventuais despesas indispensáveis ao processo, como custas, taxas, deslocamentos, cópias, certidões, serão suportadas inicialmente pelo CONTRATADO, com posterior ressarcimento, se necessário.</p>
        <p class="clausula-titulo">CLÁUSULA QUINTA – DAS OBRIGAÇÕES DO CONTRATANTE</p>
        <p>São obrigações da CONTRATANTE:</p>
        <ul><li>Fornecer toda a documentação necessária;</li><li>Manter seus dados atualizados;</li><li>Informar alterações de endereço;</li><li>Comparecer às audiências, quando necessário.</li></ul>
        <p class="clausula-titulo">CLÁUSULA SEXTA – DO CONTATO E COMUNICAÇÃO</p>
        <p>O único número de contato oficial do escritório é: ${cfg.telefone}. Não há outro número vinculado aos serviços prestados, não pedimos pagamentos antecipados para liberação de alvarás.</p>
        <p>Todas as movimentações processuais serão comunicadas à CONTRATANTE de forma clara e tempestiva.</p>
        <p>Parágrafo único: Para esclarecimento de dúvidas, a CONTRATANTE deverá agendar previamente um horário de atendimento. Ligações e consultas fora do horário comercial serão cobradas como consulta avulsa, conforme tabela vigente.</p>
        <p class="clausula-titulo">CLÁUSULA SÉTIMA – DA PROTEÇÃO DE DADOS</p>
        <p>A CONTRATANTE autoriza o CONTRATADO a tratar seus dados pessoais para os fins deste contrato e do processo judicial, conforme a Lei Geral de Proteção de Dados (LGPD) – Lei nº 13.709/2018.</p>
        <p class="clausula-titulo">CLÁUSULA OITAVA – DA RESCISÃO</p>
        <p>Este contrato poderá ser rescindido por qualquer das partes mediante notificação escrita, sendo devidos honorários proporcionais aos serviços efetivamente prestados.</p>
        <p class="clausula-titulo">CLÁUSULA NONA – DO FORO</p>
        <p>Fica eleito o foro da comarca de ${foro}, para dirimir quaisquer questões oriundas deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
        <p>E, por estarem assim justos e contratados, firmam o presente em duas vias de igual teor.</p>
        <div class="data-local">${localDataAbreviada(data)}</div>
        ${assinaturaBloco(`${cliente.nome ? cliente.nome.toUpperCase() : '[CLIENTE]'} – CONTRATANTE`, `${cfg.nomeAdvogado.toUpperCase()} – CONTRATADO(A)<br>OAB/GO nº ${cfg.oabNumero}`)}
      `;
      document.getElementById('ctr-preview').innerHTML = html;
      window._ctrCliente = cliente;
    };

    wireActionButtons('ctr', 'ctr-preview', () => `Contrato - ${(window._ctrCliente && window._ctrCliente.nome) || 'cliente'}`, { timbrado: true });
    document.getElementById('ctr-salvar').onclick = () => {
      const cliente = window._ctrCliente || readClienteFromInputs('ctr');
      saveHistorico('Contrato de Honorários', `Contrato - ${cliente.nome || 'sem cliente'}`, cliente.nome, document.getElementById('ctr-preview').innerHTML);
      toast('Documento salvo no histórico.');
    };
  }

  // ================= PROCURAÇÕES =================
  function renderProcuracoesView() {
    const el = document.getElementById('view-procuracoes');
    el.innerHTML = `
      <div class="view-header"><h2>Procuração</h2><p>Modelo "ad judicia et extra" do escritório, com timbrado.</p></div>
      <div class="card">
        <h3>Dados da procuração</h3>
        <div class="grid cols-3">
          ${clienteFieldsHtml('proc')}
          <div class="field span-2"><label>Tipo de ação</label><input id="proc-tipoacao" value="Reclamação trabalhista"></div>
          <div class="field"><label>Data</label><input type="date" id="proc-data"></div>
        </div>
        ${actionButtonsHtml('proc')}
      </div>
      <div class="card">
        <h3>Prévia do documento</h3>
        ${previewWrapHtml('proc-preview', { timbrado: true })}
      </div>
    `;
    document.getElementById('proc-data').value = new Date().toISOString().slice(0, 10);
    populateClienteSelect('proc');

    document.getElementById('proc-gerar').onclick = () => {
      const cliente = readClienteFromInputs('proc');
      const cfg = DB.getConfig();
      const tipoAcao = document.getElementById('proc-tipoacao').value || 'Reclamação trabalhista';
      const data = document.getElementById('proc-data').value;

      const html = `
        <h2>Procuração</h2>
        <p><strong>OUTORGANTE:</strong> ${qualificacaoCliente(cliente)}.</p>
        <p><strong>OUTORGADO:</strong> ${cfg.razaoSocial}, pessoa jurídica, inscrita no CNPJ ${cfg.cnpj}, neste ato representada por DRA. ${cfg.nomeAdvogado.toUpperCase()}, brasileira, ${cfg.estadoCivilAdvogada}, advogada, devidamente inscrita na OAB/GO sob o nº ${cfg.oabNumero}, com endereço profissional na ${cfg.endereco}.</p>
        <p><strong>PODERES:</strong> Pelo presente instrumento o outorgante confere ao outorgado amplos poderes para o foro em geral, com cláusula AD JUDICIA ET EXTRA, perante qualquer juízo, instância ou tribunal, outorgando-lhe poderes especiais para propor quaisquer ações, interpor qualquer recurso, receber citação inicial, confessar, conhecer a procedência do pedido, transigir, desistir, renunciar ao direito sobre o qual se funda a ação, receber, dar quitação, firmar compromissos ou acordos, assinar todo e qualquer termo, impugnar qualquer ato, discordar, excepcionar, levantar suspeição do juiz, peritos, escrivão, oficial de justiça, promotor público, atuar administrativamente em órgãos oficiais, efetivar recebimento ou levantamento de créditos através de alvará junto às escrivaninhas judiciais e a bancos oficiais (CEF e/ou Banco do Brasil) ou bancos particulares; e, finalmente, praticar todo e qualquer ato necessário, podendo substabelecer está a outrem, com ou sem reservas de iguais poderes, assinando em conjunto ou separadamente, dando tudo por bom, firme e valioso; e especialmente para atuar em ação de ${tipoAcao}.</p>
        <div class="data-local">${localDataAbreviada(data)}</div>
        ${assinaturaBloco(cliente.nome ? cliente.nome.toUpperCase() : '[CLIENTE]')}
      `;
      document.getElementById('proc-preview').innerHTML = html;
      window._procCliente = cliente;
    };

    wireActionButtons('proc', 'proc-preview', () => `Procuracao - ${(window._procCliente && window._procCliente.nome) || 'cliente'}`, { timbrado: true });
    document.getElementById('proc-salvar').onclick = () => {
      const cliente = window._procCliente || readClienteFromInputs('proc');
      saveHistorico('Procuração', `Procuração - ${cliente.nome || 'sem cliente'}`, cliente.nome, document.getElementById('proc-preview').innerHTML);
      toast('Documento salvo no histórico.');
    };
  }

  // ================= HIPOSSUFICIÊNCIA =================
  function renderHipossuficienciaView() {
    const el = document.getElementById('view-hipossuficiencia');
    el.innerHTML = `
      <div class="view-header"><h2>Declaração de Hipossuficiência</h2><p>Modelo do escritório (art. 98 do CPC), com timbrado.</p></div>
      <div class="card">
        <h3>Dados da declaração</h3>
        <div class="grid cols-3">
          ${clienteFieldsHtml('hipo')}
          <div class="field"><label>Data</label><input type="date" id="hipo-data"></div>
        </div>
        ${actionButtonsHtml('hipo')}
      </div>
      <div class="card">
        <h3>Prévia do documento</h3>
        ${previewWrapHtml('hipo-preview', { timbrado: true })}
      </div>
    `;
    document.getElementById('hipo-data').value = new Date().toISOString().slice(0, 10);
    populateClienteSelect('hipo');

    document.getElementById('hipo-gerar').onclick = () => {
      const cliente = readClienteFromInputs('hipo');
      const data = document.getElementById('hipo-data').value;

      const html = `
        <h2>Declaração de Hipossuficiência</h2>
        <p>${qualificacaoCliente(cliente)}. Declara, para os fins judiciais, não possuir mínimas condições financeiras para pagar as taxas, emolumentos, custas processuais e outros referentes à presente ação, sem que tais pagamentos afetem a sua própria subsistência, bem como de sua família, assumindo total responsabilidade sobre a veracidade da presente declaração, nos termos do artigo 98 da Lei 13.105 de 2015.</p>
        <p>Esta substitui o atestado de pobreza conforme a Lei Federal n.º 7.115, de 29 de agosto de 1983.</p>
        <div class="data-local">${localDataAbreviada(data)}</div>
        ${assinaturaBloco(cliente.nome ? cliente.nome.toUpperCase() : '[CLIENTE]')}
      `;
      document.getElementById('hipo-preview').innerHTML = html;
      window._hipoCliente = cliente;
    };

    wireActionButtons('hipo', 'hipo-preview', () => `Declaracao Hipossuficiencia - ${(window._hipoCliente && window._hipoCliente.nome) || 'cliente'}`, { timbrado: true });
    document.getElementById('hipo-salvar').onclick = () => {
      const cliente = window._hipoCliente || readClienteFromInputs('hipo');
      saveHistorico('Declaração de Hipossuficiência', `Hipossuficiência - ${cliente.nome || 'sem cliente'}`, cliente.nome, document.getElementById('hipo-preview').innerHTML);
      toast('Documento salvo no histórico.');
    };
  }

  // ================= RECIBOS =================
  function renderRecibosView() {
    const el = document.getElementById('view-recibos');
    el.innerHTML = `
      <div class="view-header"><h2>Recibo</h2><p>Recibo de pagamento com valor por extenso automático.</p></div>
      <div class="card">
        <h3>Dados do recibo</h3>
        <div class="grid cols-3">
          ${clienteFieldsHtml('rec', { compact: true })}
          <div class="field"><label>Valor (R$)</label><input type="number" step="0.01" id="rec-valor" value="0"></div>
          <div class="field span-full"><label>Referente a</label><textarea id="rec-referente" placeholder="Ex: honorários advocatícios referentes ao processo nº 0001234-56.2025.5.18.0000."></textarea></div>
          <div class="field"><label>Forma de pagamento</label>
            <select id="rec-forma"><option>PIX</option><option>dinheiro</option><option>transferência bancária</option><option>cartão de crédito</option><option>cartão de débito</option><option>cheque</option></select>
          </div>
          <div class="field"><label>Data</label><input type="date" id="rec-data"></div>
        </div>
        ${actionButtonsHtml('rec')}
      </div>
      <div class="card">
        <h3>Prévia do documento</h3>
        ${previewWrapHtml('rec-preview')}
      </div>
    `;
    document.getElementById('rec-data').value = new Date().toISOString().slice(0, 10);
    populateClienteSelect('rec');

    document.getElementById('rec-gerar').onclick = () => {
      const cliente = readClienteFromInputs('rec', { compact: true });
      const valor = document.getElementById('rec-valor').value;
      const nome = cliente.nome || '[nome do pagador]';
      const cpf = cliente.cpf;
      const referente = document.getElementById('rec-referente').value || '[descrição não informada]';
      const forma = document.getElementById('rec-forma').value;
      const data = document.getElementById('rec-data').value;
      const cfg = DB.getConfig();

      const html = `
        <h2>Recibo</h2>
        <p style="font-size:20px;text-align:center;font-weight:bold">${formatBRL(valor)}</p>
        <p>Recebi de <strong>${nome}</strong>${cpf ? `, CPF/CNPJ nº ${cpf}` : ''}, a importância de ${formatBRL(valor)} (${valorExtenso(valor)}), referente a: ${referente}, paga via ${forma}.</p>
        <p>Para clareza e efeitos legais, firmo o presente recibo.</p>
        <div class="data-local">${dataExtensoFromInput(data)}</div>
        ${assinaturaBloco(`${cfg.nomeAdvogado.toUpperCase()} — OAB/GO nº ${cfg.oabNumero}${cfg.cnpj ? ' — CNPJ ' + cfg.cnpj : ''}`)}
      `;
      document.getElementById('rec-preview').innerHTML = html;
      window._recCliente = cliente;
    };

    wireActionButtons('rec', 'rec-preview', () => `Recibo - ${(window._recCliente && window._recCliente.nome) || 'pagador'}`);
    document.getElementById('rec-salvar').onclick = () => {
      const cliente = window._recCliente || readClienteFromInputs('rec', { compact: true });
      saveHistorico('Recibo', `Recibo - ${cliente.nome || 'pagador'}`, cliente.nome, document.getElementById('rec-preview').innerHTML);
      toast('Documento salvo no histórico.');
    };
  }

  // ================= PROPOSTAS DE HONORÁRIOS =================
  function renderPropostasView() {
    const el = document.getElementById('view-propostas');
    el.innerHTML = `
      <div class="view-header"><h2>Proposta de Honorários</h2><p>Documento comercial para apresentar ao cliente antes do contrato.</p></div>
      <div class="card">
        <h3>Dados da proposta</h3>
        <div class="grid cols-3">
          <div class="field span-2"><label>Nome do cliente</label><input id="prop-nome" placeholder="Nome completo"></div>
          <div class="field"><label>Área</label>
            <select id="prop-area"><option>Trabalhista</option><option>Previdenciário / INSS</option><option>Cível</option><option>Consumidor</option><option>Família</option><option>Empresarial</option><option>Criminal</option><option>Outro</option></select>
          </div>
          <div class="field span-full"><label>Resumo do caso</label><textarea id="prop-resumo" placeholder="Resumo do que foi analisado na consulta."></textarea></div>
          <div class="field span-full"><label>Escopo dos serviços</label><textarea id="prop-escopo" placeholder="Ex: análise da documentação, elaboração e protocolo da petição inicial, acompanhamento processual até decisão final em 1ª instância.">Análise da documentação apresentada; elaboração e protocolo da petição/defesa cabível; acompanhamento processual em todas as suas fases; comunicação periódica sobre o andamento do caso.</textarea></div>
          <div class="field"><label>Modalidade de honorários</label>
            <select id="prop-modalidade">
              <option value="fixo">Valor fixo</option>
              <option value="exito">Percentual sobre êxito</option>
              <option value="misto">Fixo + percentual de êxito</option>
              <option value="mensal">Honorários mensais (contínuo)</option>
            </select>
          </div>
          <div class="field"><label>Valor fixo (R$)</label><input type="number" step="0.01" id="prop-valorfixo" value="0"></div>
          <div class="field"><label>Percentual de êxito (%)</label><input type="number" step="0.01" id="prop-percentual" value="0"></div>
          <div class="field"><label>Validade da proposta (dias)</label><input type="number" id="prop-validade" value="15"></div>
          <div class="field"><label>Data</label><input type="date" id="prop-data"></div>
        </div>
        ${actionButtonsHtml('prop')}
      </div>
      <div class="card">
        <h3>Prévia do documento</h3>
        ${previewWrapHtml('prop-preview')}
      </div>
    `;
    document.getElementById('prop-data').value = new Date().toISOString().slice(0, 10);

    document.getElementById('prop-gerar').onclick = () => {
      const nomeCliente = document.getElementById('prop-nome').value || '[cliente]';
      const area = document.getElementById('prop-area').value;
      const resumo = document.getElementById('prop-resumo').value || '[resumo não informado]';
      const escopo = document.getElementById('prop-escopo').value;
      const modalidade = document.getElementById('prop-modalidade').value;
      const valorFixo = document.getElementById('prop-valorfixo').value;
      const percentual = document.getElementById('prop-percentual').value;
      const validade = document.getElementById('prop-validade').value || 15;
      const data = document.getElementById('prop-data').value;
      const cfg = DB.getConfig();

      const html = `
        <h2>Proposta de Honorários Advocatícios</h2>
        <p>Prezado(a) <strong>${nomeCliente}</strong>,</p>
        <p>Agradecemos a confiança em nos procurar e apresentamos, a seguir, nossa proposta de honorários advocatícios referente ao caso analisado, na área ${area}.</p>
        <p class="clausula-titulo">1. Resumo do caso</p>
        <p>${resumo}</p>
        <p class="clausula-titulo">2. Escopo dos serviços</p>
        <p>${escopo}</p>
        <p class="clausula-titulo">3. Honorários advocatícios</p>
        <p>${condicoesHonorarios(modalidade, valorFixo, percentual)}</p>
        <p class="clausula-titulo">4. Validade da proposta</p>
        <p>Esta proposta é válida por ${validade} dias, a contar da data de emissão abaixo.</p>
        <p>Permanecemos à disposição para esclarecer quaisquer dúvidas.</p>
        <div class="data-local">${dataExtensoFromInput(data)}</div>
        ${assinaturaBloco(`${cfg.nomeAdvogado.toUpperCase()} — OAB/GO nº ${cfg.oabNumero}`)}
      `;
      document.getElementById('prop-preview').innerHTML = html;
      window._propNome = nomeCliente;
    };

    wireActionButtons('prop', 'prop-preview', () => `Proposta Honorarios - ${window._propNome || 'cliente'}`);
    document.getElementById('prop-salvar').onclick = () => {
      const nomeCliente = window._propNome || document.getElementById('prop-nome').value;
      saveHistorico('Proposta de Honorários', `Proposta - ${nomeCliente || 'sem cliente'}`, nomeCliente, document.getElementById('prop-preview').innerHTML);
      toast('Documento salvo no histórico.');
    };
  }

  // ================= HISTÓRICO =================
  function renderHistoricoView() {
    const wrap = document.getElementById('historicoTableWrap');
    const docs = DB.listDocumentos();
    if (docs.length === 0) {
      wrap.innerHTML = `<div class="empty-state">Nenhum documento salvo ainda.</div>`;
      return;
    }
    wrap.innerHTML = `
      <table>
        <thead><tr><th>Tipo</th><th>Título</th><th>Cliente</th><th>Data</th><th></th></tr></thead>
        <tbody>
          ${docs.map(d => `
            <tr>
              <td><span class="tag">${d.tipo}</span></td>
              <td>${d.titulo}</td>
              <td>${d.clienteNome || '—'}</td>
              <td>${new Date(d.criadoEm).toLocaleString('pt-BR')}</td>
              <td style="white-space:nowrap">
                <button class="btn btn-sm" data-hist-view="${d.id}">Ver</button>
                <button class="btn btn-sm" data-hist-word="${d.id}">.doc</button>
                <button class="btn btn-sm btn-danger" data-hist-del="${d.id}">Excluir</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="doc-preview-wrap" id="histPreviewWrap" style="display:none;margin-top:20px">
        <div class="doc-preview" id="histPreview"></div>
      </div>
    `;
    wrap.querySelectorAll('[data-hist-view]').forEach(btn => btn.onclick = () => {
      const doc = docs.find(d => d.id === btn.dataset.histView);
      document.getElementById('histPreviewWrap').style.display = 'block';
      document.getElementById('histPreview').innerHTML = doc.conteudoHtml;
    });
    wrap.querySelectorAll('[data-hist-word]').forEach(btn => btn.onclick = () => {
      const doc = docs.find(d => d.id === btn.dataset.histWord);
      downloadAsWord(doc.conteudoHtml, doc.titulo);
    });
    wrap.querySelectorAll('[data-hist-del]').forEach(btn => btn.onclick = () => {
      if (confirm('Excluir este documento do histórico?')) {
        DB.deleteDocumento(btn.dataset.histDel);
        renderHistoricoView();
        toast('Documento excluído.');
      }
    });
  }

  return {
    valorExtenso, formatBRL, dataExtensoFromInput, localDataAbreviada,
    qualificacaoCliente, assinaturaBloco,
    downloadAsWord, printHtml, toast,
    renderContratosView, renderProcuracoesView, renderHipossuficienciaView,
    renderRecibosView, renderPropostasView, renderHistoricoView,
  };
})();
