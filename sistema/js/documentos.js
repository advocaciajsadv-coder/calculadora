/* ==========================================================================
   documentos.js — Geradores de documentos (contrato, procuração,
   declaração de hipossuficiência, recibo, proposta de honorários)
   Os dados do cliente são digitados direto em cada formulário.
   ========================================================================== */

const Docs = (() => {

  // ---------------- Valor por extenso (R$) ----------------
  const UNI = ['zero','um','dois','três','quatro','cinco','seis','sete','oito','nove'];
  const DEZ10 = ['dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
  const DEZ = ['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
  const CEM = ['','cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];

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

  function formatBRL(v) {
    return (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

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

  // ---------------- Campos de cliente (digitados direto no formulário) ----------------
  function clienteFieldsHtml(prefix, opts) {
    opts = opts || {};
    return `
      <div class="field span-2"><label>Nome completo do cliente</label><input id="${prefix}-nome" placeholder="Nome completo"></div>
      <div class="field"><label>CPF</label><input id="${prefix}-cpf" placeholder="000.000.000-00"></div>
      ${opts.compact ? '' : `
      <div class="field"><label>RG</label><input id="${prefix}-rg"></div>
      <div class="field"><label>Nacionalidade</label><input id="${prefix}-nacionalidade" value="brasileira"></div>
      <div class="field"><label>Estado civil</label>
        <select id="${prefix}-estadocivil">
          <option>solteiro(a)</option><option>casado(a)</option><option>divorciado(a)</option>
          <option>viúvo(a)</option><option>união estável</option>
        </select>
      </div>
      <div class="field"><label>Profissão</label><input id="${prefix}-profissao"></div>
      <div class="field span-2"><label>Endereço</label><input id="${prefix}-endereco" placeholder="Rua, número, bairro"></div>
      <div class="field"><label>Cidade/UF</label><input id="${prefix}-cidadeuf" placeholder="Anápolis/GO"></div>
      `}
    `;
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
      c.rg = val(`${prefix}-rg`);
      c.nacionalidade = val(`${prefix}-nacionalidade`);
      c.estadoCivil = document.getElementById(`${prefix}-estadocivil`) ? document.getElementById(`${prefix}-estadocivil`).value : '';
      c.profissao = val(`${prefix}-profissao`);
      c.endereco = val(`${prefix}-endereco`);
      c.cidadeUf = val(`${prefix}-cidadeuf`);
    }
    return c;
  }

  function qualificacaoCliente(c) {
    if (!c || !c.nome) return '[dados do cliente não preenchidos]';
    const partes = [];
    partes.push(`<strong>${c.nome}</strong>`);
    if (c.nacionalidade) partes.push(c.nacionalidade);
    if (c.estadoCivil) partes.push(c.estadoCivil);
    if (c.profissao) partes.push(c.profissao);
    if (c.rg) partes.push(`portador(a) do RG nº ${c.rg}`);
    if (c.cpf) partes.push(`inscrito(a) no CPF sob o nº ${c.cpf}`);
    if (c.endereco) partes.push(`residente e domiciliado(a) em ${c.endereco}${c.cidadeUf ? ', ' + c.cidadeUf : ''}`);
    return partes.join(', ');
  }

  function qualificacaoAdvogada() {
    const cfg = DB.getConfig();
    return `<strong>${cfg.nomeAdvogado}</strong>, advogada, inscrita na ${cfg.oab}${cfg.cnpj ? ', CNPJ nº ' + cfg.cnpj : ''}, com endereço profissional em ${cfg.endereco ? cfg.endereco + ', ' : ''}${cfg.cidade}/${cfg.uf}`;
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

  // ---------------- Exportar / Imprimir ----------------
  function downloadAsWord(innerHtml, filename) {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.7;color:#1a1a1a;padding:40px 60px}
      h2{text-align:center;font-size:16px;letter-spacing:1px;text-transform:uppercase;margin-bottom:22px}
      p{margin-bottom:14px;text-align:justify}
      .clausula-titulo{font-weight:bold;margin-top:18px}
      .assinaturas{margin-top:60px}
      .linha-assinatura{margin-top:46px;text-align:center}
      .linha-assinatura .linha{border-top:1px solid #333;width:320px;margin:0 auto 6px}
      .data-local{margin-top:34px;text-align:right}
      </style></head><body>${innerHtml}</body></html>`;
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

  function printHtml(innerHtml) {
    const area = document.getElementById('printArea');
    area.innerHTML = innerHtml;
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

  function wireActionButtons(prefix, previewElId, filenameFn) {
    document.getElementById(`${prefix}-baixar`).onclick = () => {
      downloadAsWord(document.getElementById(previewElId).innerHTML, filenameFn());
    };
    document.getElementById(`${prefix}-imprimir`).onclick = () => {
      printHtml(document.getElementById(previewElId).innerHTML);
    };
  }

  // ================= CONTRATOS =================
  function renderContratosView() {
    const el = document.getElementById('view-contratos');
    el.innerHTML = `
      <div class="view-header"><h2>Contrato de Honorários Advocatícios</h2><p>Gere o contrato preenchendo os dados abaixo.</p></div>
      <div class="card">
        <h3>Dados do contrato</h3>
        <div class="grid cols-3">
          ${clienteFieldsHtml('ctr')}
          <div class="field"><label>Área</label>
            <select id="ctr-area"><option>Trabalhista</option><option>Previdenciário / INSS</option><option>Cível</option><option>Consumidor</option><option>Família</option><option>Empresarial</option><option>Criminal</option><option>Outro</option></select>
          </div>
          <div class="field span-full"><label>Objeto / descrição do caso</label><textarea id="ctr-objeto" placeholder="Ex: ação trabalhista em face de..., visando o recebimento de verbas rescisórias não pagas."></textarea></div>
          <div class="field"><label>Modalidade de honorários</label>
            <select id="ctr-modalidade">
              <option value="fixo">Valor fixo</option>
              <option value="exito">Percentual sobre êxito</option>
              <option value="misto">Fixo + percentual de êxito</option>
              <option value="mensal">Honorários mensais (contínuo)</option>
            </select>
          </div>
          <div class="field"><label>Valor fixo (R$)</label><input type="number" step="0.01" id="ctr-valorfixo" value="0"></div>
          <div class="field"><label>Percentual de êxito (%)</label><input type="number" step="0.01" id="ctr-percentual" value="0"></div>
          <div class="field span-full"><label>Forma de pagamento</label><textarea id="ctr-pagamento" placeholder="Ex: à vista via PIX, ou em até 3x no cartão."></textarea></div>
          <div class="field"><label>Foro / Comarca</label><input id="ctr-foro" placeholder="Ex: Anápolis/GO"></div>
          <div class="field"><label>Data do contrato</label><input type="date" id="ctr-data"></div>
        </div>
        ${actionButtonsHtml('ctr')}
      </div>
      <div class="card">
        <h3>Prévia do documento</h3>
        <div class="doc-preview-wrap"><div class="doc-preview" id="ctr-preview" contenteditable="true">Preencha os dados acima e clique em "Gerar / Atualizar documento".</div></div>
      </div>
    `;
    document.getElementById('ctr-data').value = new Date().toISOString().slice(0, 10);

    document.getElementById('ctr-gerar').onclick = () => {
      const cliente = readClienteFromInputs('ctr');
      const area = document.getElementById('ctr-area').value;
      const objeto = document.getElementById('ctr-objeto').value || '[objeto não informado]';
      const modalidade = document.getElementById('ctr-modalidade').value;
      const valorFixo = document.getElementById('ctr-valorfixo').value;
      const percentual = document.getElementById('ctr-percentual').value;
      const pagamento = document.getElementById('ctr-pagamento').value;
      const foro = document.getElementById('ctr-foro').value || `${DB.getConfig().cidade}/${DB.getConfig().uf}`;
      const data = document.getElementById('ctr-data').value;

      const html = `
        <h2>Contrato de Prestação de Serviços Advocatícios</h2>
        <p>Pelo presente instrumento particular, de um lado ${qualificacaoCliente(cliente)}, doravante denominado(a) <strong>CONTRATANTE</strong>; e, de outro lado, ${qualificacaoAdvogada()}, doravante denominada <strong>CONTRATADA</strong>; têm entre si justo e contratado o que segue.</p>
        <p class="clausula-titulo">CLÁUSULA PRIMEIRA — DO OBJETO</p>
        <p>A CONTRATADA prestará serviços advocatícios à CONTRATANTE na área ${area}, especificamente quanto a: ${objeto}.</p>
        <p class="clausula-titulo">CLÁUSULA SEGUNDA — DOS HONORÁRIOS</p>
        <p>${condicoesHonorarios(modalidade, valorFixo, percentual)}</p>
        <p class="clausula-titulo">CLÁUSULA TERCEIRA — DA FORMA DE PAGAMENTO</p>
        <p>${pagamento || 'A ser combinado entre as partes.'}</p>
        <p class="clausula-titulo">CLÁUSULA QUARTA — DAS OBRIGAÇÕES DAS PARTES</p>
        <p>A CONTRATANTE se compromete a fornecer, com veracidade e presteza, todos os documentos e informações necessários ao bom desempenho dos serviços contratados. A CONTRATADA se compromete a exercer o mandato com zelo, diligência e observância aos preceitos éticos da advocacia, mantendo a CONTRATANTE informada sobre o andamento do caso.</p>
        <p class="clausula-titulo">CLÁUSULA QUINTA — DA RESCISÃO</p>
        <p>O presente contrato poderá ser rescindido por qualquer das partes, mediante comunicação por escrito, resguardado o direito da CONTRATADA ao recebimento dos honorários proporcionais aos serviços já prestados até a data da rescisão, bem como dos honorários de sucumbência a que fizer jus.</p>
        <p class="clausula-titulo">CLÁUSULA SEXTA — DO FORO</p>
        <p>Fica eleito o foro da comarca de ${foro} para dirimir quaisquer dúvidas oriundas do presente contrato, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
        <p>E, por estarem assim justas e contratadas, as partes firmam o presente instrumento em duas vias de igual teor e forma.</p>
        <div class="data-local">${dataExtensoFromInput(data)}</div>
        ${assinaturaBloco('CONTRATANTE', 'CONTRATADA — ' + DB.getConfig().nomeAdvogado)}
      `;
      document.getElementById('ctr-preview').innerHTML = html;
      window._ctrCliente = cliente;
    };

    wireActionButtons('ctr', 'ctr-preview', () => `Contrato - ${(window._ctrCliente && window._ctrCliente.nome) || 'cliente'}`);
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
      <div class="view-header"><h2>Procuração</h2><p>Procuração "ad judicia et extra" com poderes especiais.</p></div>
      <div class="card">
        <h3>Dados da procuração</h3>
        <div class="grid cols-3">
          ${clienteFieldsHtml('proc')}
          <div class="field"><label>Finalidade</label>
            <select id="proc-finalidade">
              <option>ação trabalhista</option>
              <option>ação previdenciária perante o INSS e/ou a Justiça Federal</option>
              <option>ação cível</option>
              <option>ação de família</option>
              <option>processo administrativo</option>
              <option>o foro em geral, para todos os fins de direito</option>
            </select>
          </div>
          <div class="field span-full">
            <label>Poderes especiais</label>
            <div style="display:flex;flex-wrap:wrap;gap:14px;padding:10px 0">
              <label style="display:flex;gap:6px;align-items:center;font-size:13px"><input type="checkbox" id="proc-p1" checked> substabelecer, com ou sem reserva de poderes</label>
              <label style="display:flex;gap:6px;align-items:center;font-size:13px"><input type="checkbox" id="proc-p2" checked> receber citação inicial</label>
              <label style="display:flex;gap:6px;align-items:center;font-size:13px"><input type="checkbox" id="proc-p3" checked> confessar, transigir, firmar acordos</label>
              <label style="display:flex;gap:6px;align-items:center;font-size:13px"><input type="checkbox" id="proc-p4" checked> desistir e renunciar a direitos</label>
              <label style="display:flex;gap:6px;align-items:center;font-size:13px"><input type="checkbox" id="proc-p5" checked> receber e dar quitação</label>
            </div>
          </div>
          <div class="field"><label>Foro / Comarca</label><input id="proc-foro" placeholder="Ex: Anápolis/GO"></div>
          <div class="field"><label>Data</label><input type="date" id="proc-data"></div>
        </div>
        ${actionButtonsHtml('proc')}
      </div>
      <div class="card">
        <h3>Prévia do documento</h3>
        <div class="doc-preview-wrap"><div class="doc-preview" id="proc-preview" contenteditable="true">Preencha os dados acima e clique em "Gerar / Atualizar documento".</div></div>
      </div>
    `;
    document.getElementById('proc-data').value = new Date().toISOString().slice(0, 10);

    document.getElementById('proc-gerar').onclick = () => {
      const cliente = readClienteFromInputs('proc');
      const finalidade = document.getElementById('proc-finalidade').value;
      const data = document.getElementById('proc-data').value;
      const poderes = [];
      if (document.getElementById('proc-p1').checked) poderes.push('substabelecer o presente, com ou sem reserva de poderes');
      if (document.getElementById('proc-p2').checked) poderes.push('receber citação inicial');
      if (document.getElementById('proc-p3').checked) poderes.push('confessar, transigir e firmar acordos');
      if (document.getElementById('proc-p4').checked) poderes.push('desistir e renunciar a direitos');
      if (document.getElementById('proc-p5').checked) poderes.push('receber e dar quitação');

      const html = `
        <h2>Procuração</h2>
        <p><strong>OUTORGANTE:</strong> ${qualificacaoCliente(cliente)}.</p>
        <p><strong>OUTORGADA:</strong> ${qualificacaoAdvogada()}.</p>
        <p><strong>PODERES:</strong> Pelo presente instrumento particular de mandato, o(a) OUTORGANTE nomeia e constitui sua bastante procuradora a OUTORGADA acima qualificada, a quem confere amplos poderes para o foro em geral, com a cláusula "ad judicia et extra", em qualquer Juízo, Instância ou Tribunal, podendo propor contra quem de direito as ações competentes e defendê-lo(a) nas contrárias, especialmente para atuar em ${finalidade}, podendo ainda ${poderes.join(', ')}, usar de recursos legais e acompanhá-los, conferindo-lhe, por fim, todos os poderes necessários ao bom e fiel cumprimento do presente mandato, dando tudo por bom, firme e valioso.</p>
        <div class="data-local">${dataExtensoFromInput(data)}</div>
        ${assinaturaBloco('OUTORGANTE')}
      `;
      document.getElementById('proc-preview').innerHTML = html;
      window._procCliente = cliente;
    };

    wireActionButtons('proc', 'proc-preview', () => `Procuracao - ${(window._procCliente && window._procCliente.nome) || 'cliente'}`);
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
      <div class="view-header"><h2>Declaração de Hipossuficiência Econômica</h2><p>Para fins de concessão da Justiça Gratuita (Lei 1.060/50 e arts. 98/99 do CPC).</p></div>
      <div class="card">
        <h3>Dados da declaração</h3>
        <div class="grid cols-3">
          ${clienteFieldsHtml('hipo')}
          <div class="field"><label>Renda mensal aproximada (opcional)</label><input type="number" step="0.01" id="hipo-renda" placeholder="Deixe em branco para omitir"></div>
          <div class="field span-full"><label>Observação adicional (opcional)</label><textarea id="hipo-obs" placeholder="Ex: encontra-se desempregado(a) no momento."></textarea></div>
          <div class="field"><label>Data</label><input type="date" id="hipo-data"></div>
        </div>
        ${actionButtonsHtml('hipo')}
      </div>
      <div class="card">
        <h3>Prévia do documento</h3>
        <div class="doc-preview-wrap"><div class="doc-preview" id="hipo-preview" contenteditable="true">Preencha os dados acima e clique em "Gerar / Atualizar documento".</div></div>
      </div>
    `;
    document.getElementById('hipo-data').value = new Date().toISOString().slice(0, 10);

    document.getElementById('hipo-gerar').onclick = () => {
      const cliente = readClienteFromInputs('hipo');
      const renda = document.getElementById('hipo-renda').value;
      const obs = document.getElementById('hipo-obs').value;
      const data = document.getElementById('hipo-data').value;

      const html = `
        <h2>Declaração de Hipossuficiência Econômica</h2>
        <p>Eu, ${qualificacaoCliente(cliente)}, DECLARO, sob as penas da lei, para fins de concessão dos benefícios da Justiça Gratuita, nos termos da Lei nº 1.060, de 05 de fevereiro de 1950, e dos artigos 98 e 99 do Código de Processo Civil, que não possuo condições financeiras de arcar com as custas processuais, despesas cartorárias, periciais e honorários advocatícios do processo a ser ajuizado, sem prejuízo do meu próprio sustento e de minha família.</p>
        ${renda ? `<p>Declaro, ainda, que minha renda mensal aproximada é de ${formatBRL(renda)} (${valorExtenso(renda)}).</p>` : ''}
        ${obs ? `<p>${obs}</p>` : ''}
        <p>Declaro estar ciente de que a presente declaração é feita sob minha inteira responsabilidade, podendo a falsidade das informações aqui prestadas configurar crime previsto no art. 299 do Código Penal, bem como no art. 100, parágrafo único, do Código de Processo Civil.</p>
        <p>Por ser verdade, firmo a presente declaração.</p>
        <div class="data-local">${dataExtensoFromInput(data)}</div>
        ${assinaturaBloco('Declarante')}
      `;
      document.getElementById('hipo-preview').innerHTML = html;
      window._hipoCliente = cliente;
    };

    wireActionButtons('hipo', 'hipo-preview', () => `Declaracao Hipossuficiencia - ${(window._hipoCliente && window._hipoCliente.nome) || 'cliente'}`);
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
        <div class="doc-preview-wrap"><div class="doc-preview" id="rec-preview" contenteditable="true">Preencha os dados acima e clique em "Gerar / Atualizar documento".</div></div>
      </div>
    `;
    document.getElementById('rec-data').value = new Date().toISOString().slice(0, 10);

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
        ${assinaturaBloco(`${cfg.nomeAdvogado} — ${cfg.oab}${cfg.cnpj ? ' — CNPJ ' + cfg.cnpj : ''}`)}
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
        <div class="doc-preview-wrap"><div class="doc-preview" id="prop-preview" contenteditable="true">Preencha os dados acima e clique em "Gerar / Atualizar documento".</div></div>
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
        ${assinaturaBloco(`${cfg.nomeAdvogado} — ${cfg.oab}`)}
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
    valorExtenso, formatBRL, dataExtensoFromInput,
    qualificacaoCliente, qualificacaoAdvogada, assinaturaBloco,
    downloadAsWord, printHtml, toast,
    renderContratosView, renderProcuracoesView, renderHipossuficienciaView,
    renderRecibosView, renderPropostasView, renderHistoricoView,
  };
})();
