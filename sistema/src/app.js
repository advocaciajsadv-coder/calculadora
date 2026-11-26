/* ===== Escritório Online: cópia fiel das telas do sistema antigo (Floot) ===== */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const TZ="America/Sao_Paulo";
const hojeIso=()=>new Date().toLocaleDateString("sv-SE",{timeZone:TZ});
const dataBr=iso=>iso?String(iso).slice(0,10).split("-").reverse().join("/"):"—";
const agoraIso=()=>new Date().toISOString();
const fmtDH=d=>new Date(d).toLocaleString("pt-BR",{timeZone:TZ,day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
const fmtDHL=d=>new Date(d).toLocaleString("pt-BR",{timeZone:TZ});
const parseR=s=>new Date(String(s).length===16?s+":00-03:00":s);
const fmtR=s=>fmtDH(parseR(s));
const uid=()=>Math.random().toString(36).slice(2,10);

/* ---------- configuração (porte de atendimentoConfig) ---------- */
const AREAS={trabalhista:"Trabalhista",previdenciario:"Previdenciário",civel:"Cível"};
const ORIGENS=["Calculadora Trabalhista","Google","Google Meu Negócio","Instagram","Anúncio no Meta","Indicação","Passou na porta","WhatsApp direto","Site","Outro"];
const R_TRIAGEM={em_triagem:"Em triagem",viavel:"Viável",inviavel:"Inviável",talvez_futuro:"Talvez no futuro"};
const R_ENTREV={a_fazer:"A fazer",agendada:"Agendada",realizada:"Realizada",ficha_revisada:"Ficha revisada"};
const R_CONTR={nao_iniciada:"Não iniciada",proposta_enviada:"Proposta enviada",aguardando_assinatura:"Aguardando assinatura",assinada:"Assinada",nao_fechou:"Encerrado sem contratação"};
const R_DOCS={nao_iniciada:"Não iniciada",solicitados:"Solicitados",parcial:"Recebidos em parte",conferidos:"Conferidos"};
const R_MINUTA={nao_iniciada:"Não enviado ao Jurídico",minuta_gerada:"Enviado ao Jurídico",em_revisao:"Jurídico: em análise",aprovada:"Jurídico: pronto para protocolar",protocolada:"Jurídico: protocolada"};
const R_DOCITEM={solicitado:"Pendente de recebimento",recebido:"Recebido, aguardando conferência",conferido:"Conferido",precisa_correcao:"Ilegível ou incompleto",dispensado:"Dispensado com justificativa"};
const R_TAREFA={pendente:"Pendente",em_andamento:"Em andamento",concluida:"Concluída"};
const CHECKLIST={
 trabalhista:["Documento de identificação com foto e CPF","Comprovante de residência","CTPS (cópia de todas as páginas relevantes)","Contracheques / recibos de pagamento","Termo de rescisão (TRCT), se houver","Extrato do FGTS","Registros de jornada (cartão de ponto, escalas, mensagens)","Provas do vínculo ou dos fatos (conversas, fotos, comprovantes)","Contatos de possíveis testemunhas"],
 previdenciario:["Documento de identificação com foto e CPF","Comprovante de residência","CNIS atualizado","CTPS e demais comprovantes de vínculo e contribuição","Protocolo e resposta do requerimento no INSS (Meu INSS)","Laudos, exames e receitas médicas, se houver incapacidade ou deficiência","Documentos da composição familiar e renda, se o benefício exigir"],
 civel:["Documento de identificação com foto e CPF","Comprovante de residência","Documentos que comprovem os fatos (contratos, comprovantes, conversas)"]
};
const rot=(m,v)=>m[v]!==undefined?m[v]:v;

/* ---------- ícones (traçado lucide) ---------- */
const IC={
 posvenda:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
 hoje:'<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
 comercial:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
 juridico:'<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
 clientes:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
 agenda:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
 biblioteca:'<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
 fechamentos:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
 voltar:'<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
 check:'<path d="M20 6 9 17l-5-5"/>',
 mais:'<path d="M5 12h14M12 5v14"/>',
 lixo:'<path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
 busca:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
 pasta:'<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
 externo:'<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
 arquivo:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/>',
 lua:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'
};
const ico=(n,s=18)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]||""}</svg>`;

/* ---------- estado ---------- */
let db=null,col=null,itens=[],carregou=false,baixas={};
let rota={nome:"hoje",id:null};
let ui={comTab:"fluxo",visao:"etapas",filtro:"andamento",busca:"",abaAt:null,bibTab:"mensagens",juridicoFiltro:"todos"};
const DEF=()=>({nome:"",telefone:"",origem:"",area:"trabalhista",assunto:"",triagem:"em_triagem",triagemNotas:"",retomarEm:"",reuniaoEm:"",
 situacaoEntrevista:"a_fazer",situacaoContratacao:"nao_iniciada",situacaoDocumentos:"nao_iniciada",situacaoMinuta:"nao_iniciada",
 prepEtapa:"",prepVia:"",prepTipo:"",prepResponsavel:"",prepProvidencia:"",prepPrazoInterno:"",prepPrazoOficial:"",prepPrazoOficialDesc:"",prepChecklist:[],prepPendencias:[],prepVersoes:[],prepRevisoes:[],prepProtocolo:null,
 fechamentoPor:"",assinadoEm:"",motivoEncerramento:"",kitGeradoEm:"",kitEnviadoEm:"",kitVersoes:[],tramEnvelopeId:"",tramConfirmado:"",tramSyncEm:"",tramErro:"",tramUrl:"",posStatus:"",posResponsavel:"",posRevEm:"",posEntrevista:"",posResumo:{},posPend:[],posEncaminhamentos:[],posDevolucoes:[],fichaLinkManual:"",posRetornoFicha:"",fichaEnviadaEm:"",fichaRecebidaEm:"",posRevisor:"",posRecebe:"",posProvidencia:"",fichaVersoes:[],responsavel:"Dra. Jackeline",pastaDrive:"",observacoes:"",arquivado:false,ultimoContatoEm:"",followupEm:"",
 criadoEm:"",atualizadoEm:"",docs:[],tarefas:[],historico:[],ficha:{respostas:{},assuntos:[],revisada:false},cadastro:{}});
const norm=(id,d)=>{const x=Object.assign(DEF(),d||{});x.id=id;if(!Array.isArray(x.docs))x.docs=[];if(!Array.isArray(x.tarefas))x.tarefas=[];if(!Array.isArray(x.historico))x.historico=[];
 x.ficha=Object.assign({respostas:{},assuntos:[],revisada:false},x.ficha||{});if(!Array.isArray(x.ficha.assuntos))x.ficha.assuntos=[];if(!x.ficha.respostas)x.ficha.respostas={};x.cadastro=x.cadastro||{};return x};
const porId=id=>itens.find(a=>a.id===id);
function aviso(t){const e=$("#aviso");e.textContent=t||"";e.style.display=t?"block":"none"}
function toast(t){const e=$("#aviso");e.textContent=t;e.style.display="block";e.style.borderColor="var(--success)";clearTimeout(toast._t);toast._t=setTimeout(()=>{e.style.display="none";e.style.borderColor="var(--warning)"},2600)}

async function gravar(id,patch,log){
  const a=porId(id);if(!a)return;
  const agora=agoraIso();
  patch=Object.assign({},patch,{atualizadoEm:agora});
  if(log){patch.historico=[...(a.historico||[]),{em:agora,texto:log}]}
  // otimista, depois confirma no banco
  const nest=patch.ficha;
  Object.keys(patch).forEach(k=>{if(k==="ficha"){a.ficha=Object.assign({},a.ficha,nest,{respostas:Object.assign({},a.ficha.respostas,nest.respostas||{})})}else a[k]=patch[k]});
  if(col){try{await col.doc(id).update(patch)}catch(e){aviso("Não foi possível salvar agora ("+(e&&e.code||"erro")+"). Tente de novo.")}}
}
async function criar(d){
  const agora=agoraIso();
  const log=d.logInicial||"Lead criado";d=Object.assign({},d);delete d.logInicial;
  const x=Object.assign(DEF(),d,{criadoEm:agora,atualizadoEm:agora,historico:[{em:agora,texto:log}]});
  if(!col){aviso("Entre na sua conta do Claude para salvar.");return null}
  try{const ref=await col.add(x);return ref.id}catch(e){aviso("Não foi possível criar agora ("+(e&&e.code||"erro")+").");return null}
}

/* ---------- regras (porte de proximoPassoAtend, followups, fluxoEtapas) ---------- */
const docsPend=a=>a.docs.filter(d=>d.situacao==="solicitado"||d.situacao==="precisa_correcao").length;
function proximoPasso(a){
  const p=docsPend(a);
  if(a.triagem==="em_triagem")return{texto:"Fazer a triagem",tom:"atencao"};
  if(a.triagem==="inviavel")return{texto:"Inviável",tom:"neutro"};
  if(a.triagem==="talvez_futuro"){const d=a.retomarEm;if(!d)return{texto:"Talvez no futuro (sem data)",tom:"neutro"};return{texto:"Retomar em "+dataBr(d),tom:d<=hojeIso()?"atencao":"neutro"}}
  if(a.situacaoContratacao==="nao_fechou")return{texto:"Não fechou",tom:"neutro"};
  if(a.situacaoMinuta==="protocolada")return{texto:"Protocolada pelo Jurídico",tom:"ok"};
  if(a.situacaoContratacao==="aguardando_assinatura")return{texto:"Cobrar assinatura",tom:"atencao"};
  if(a.situacaoContratacao==="proposta_enviada")return{texto:"Acompanhar proposta",tom:"atencao"};
  if(a.situacaoEntrevista==="a_fazer"&&a.reuniaoEm)return{texto:"Reunião agendada para "+fmtR(a.reuniaoEm),tom:"neutro"};
  if(a.situacaoEntrevista==="a_fazer")return{texto:"Concluir pré-atendimento",tom:"atencao"};
  if(a.situacaoEntrevista==="agendada")return a.reuniaoEm?{texto:"Reunião agendada para "+fmtR(a.reuniaoEm),tom:"neutro"}:{texto:"Realizar o atendimento",tom:"atencao"};
  if(a.situacaoEntrevista==="realizada")return{texto:"Revisar o pré-atendimento",tom:"atencao"};
  if(a.situacaoContratacao!=="assinada")return{texto:"Enviar proposta",tom:"atencao"};
  if(a.situacaoDocumentos!=="conferidos")return{texto:p>0?`Cobrar ${p} documento(s)`:"Conferir documentos",tom:"atencao"};
  if(a.situacaoMinuta==="nao_iniciada")return{texto:"Pronto: enviar o caso ao Jurídico",tom:"ok"};
  if(a.situacaoMinuta==="minuta_gerada")return{texto:"Enviado ao Jurídico: aguardar retorno",tom:"neutro"};
  if(a.situacaoMinuta==="em_revisao")return{texto:"Com o Jurídico: em análise",tom:"neutro"};
  return{texto:"Com o Jurídico: aguardando protocolo",tom:"neutro"};
}
const tomBadge=t=>t==="ok"?"success":t==="atencao"?"warning":"secondary";
function etapaCol(a){
  if(a.triagem==="inviavel")return null;
  if(a.triagem==="em_triagem")return"triagem";
  if(a.triagem==="talvez_futuro")return"futuro";
  if(a.situacaoContratacao==="nao_fechou")return null;
  if(a.situacaoMinuta==="protocolada")return"acompanhamento";
  if(a.situacaoContratacao==="proposta_enviada"||a.situacaoContratacao==="aguardando_assinatura")return"contrato";
  if(a.situacaoEntrevista==="a_fazer"||a.situacaoEntrevista==="agendada")return"entrevista";
  if(a.situacaoContratacao!=="assinada")return"contrato";
  if(a.situacaoDocumentos!=="conferidos")return"documentos";
  return"minuta";
}
const COLUNAS=[
 {e:"triagem",r:"Triagem",g:"Comercial"},{e:"entrevista",r:"Pré-atendimento",g:"Comercial"},{e:"contrato",r:"Contrato",g:"Comercial"},
 {e:"documentos",r:"Documentos",g:"Pós-venda"},{e:"minuta",r:"Prontos para enviar",g:"Falta só o envio ao Jurídico"},
 {e:"acompanhamento",r:"Acompanhamento",g:"Pós-venda"},{e:"futuro",r:"Talvez no futuro",g:"Em espera"}
];
/* follow-up */
const MIN=1,DIA=1440;
const ROT_FU={triagem:"Triagem",contrato:"Contrato",entrevista:"Pré-atendimento",documentos:"Documentos",acompanhamento:"Acompanhamento"};
const OPC_FU={triagem:[[30,"30 min"],[DIA,"1 dia"],[2*DIA,"2 dias"],[3*DIA,"3 dias"],[7*DIA,"1 semana"],[15*DIA,"15 dias"],[30*DIA,"30 dias"]],
 entrevista:[[DIA,"1 dia"],[2*DIA,"2 dias"],[7*DIA,"1 semana"],[15*DIA,"15 dias"],[30*DIA,"30 dias"]]};
const PADRAO={triagem:DIA,entrevista:DIA,contrato:DIA,documentos:DIA,acompanhamento:30*DIA};
const ms=d=>new Date(d).getTime();
function textoPrazo(m){const abs=Math.abs(m);const u=abs<60?abs+" min":abs<2*DIA?Math.round(abs/60)+" h":Math.round(abs/DIA)+" dias";if(abs<1)return"Agora";return m>0?"Atrasado "+u:"Em "+u}
function followupDe(a,agora){
  if(a.arquivado||a.triagem==="inviavel"||a.situacaoContratacao==="nao_fechou")return null;
  const pn=(a.nome||"").replace(/\(TESTE\)/i,"").trim().split(/\s+/)[0]||"";
  const pend=docsPend(a);const ultimo=a.ultimoContatoEm||null;const calc=a.origem==="Calculadora Trabalhista";
  let etapa=null,motivo="",acao="",mensagem="",fallback=a.atualizadoEm||a.criadoEm,venceFixo=null;
  if(a.triagem==="talvez_futuro"){
    if(a.retomarEm){etapa="entrevista";venceFixo=ms(a.retomarEm+"T09:00:00-03:00");motivo="Data combinada para retomar o contato.";acao="Retomar o contato";mensagem=`Olá, ${pn}! Tudo bem? Passando para saber se já podemos retomar a conversa sobre o seu caso.`}
  }else if(a.triagem==="em_triagem"){
    etapa="triagem";fallback=a.criadoEm;motivo="Lead em triagem sem resposta.";acao="Retomar a conversa e concluir a triagem";
    mensagem=calc?`Oi, ${pn}! Conseguiu ver minha mensagem? A calculadora mostra só uma estimativa. Dependendo do que aconteceu no seu trabalho, podem existir outros valores a receber. Me responde só uma coisa: você ainda está trabalhando na empresa?`:`Olá, ${pn}! Tudo bem? Estamos retomando o nosso contato sobre o seu caso. Você ainda tem interesse em seguir com a análise?`;
  }else if(a.triagem==="viavel"){
    if(a.situacaoContratacao==="proposta_enviada"||a.situacaoContratacao==="aguardando_assinatura"){
      const ag=a.situacaoContratacao==="aguardando_assinatura";etapa="contrato";
      motivo=ag?"Contrato enviado, ainda não assinado.":"Proposta enviada, sem retorno.";acao=ag?"Cobrar a assinatura":"Cobrar resposta da proposta";
      mensagem=calc?(ag?`Oi, ${pn}! Seu contrato ficou pendente aqui. Ficou alguma dúvida ou tem alguma coisa te impedindo de seguir com o caso? Se quiser, me fala que eu te ajudo agora.`:`Oi, ${pn}! Ficou alguma dúvida sobre como funciona o processo ou sobre os honorários? Se tiver algo te impedindo de seguir, me fala que eu esclareço pra você.`):`Olá, ${pn}! Tudo bem? Passando para saber se você conseguiu ver o contrato que enviamos. Se tiver qualquer dúvida, é só nos chamar que explicamos com calma.`;
    }else if(a.situacaoEntrevista==="a_fazer"&&!a.reuniaoEm&&a.situacaoContratacao!=="assinada"){
      etapa="entrevista";motivo="Caso viável, pré-atendimento ainda não concluído.";acao="Concluir o pré-atendimento";
      mensagem=calc?`Oi, ${pn}! Pelo que você me contou, existe uma situação que vale analisar com cuidado. Posso te ligar por 5 minutos e te explicar o que pode ser feito?`:`Olá, ${pn}! Tudo bem? Podemos seguir com o seu pré-atendimento. Você prefere conversar por ligação ou receber nosso retorno por mensagem?`;
    }else if(a.situacaoContratacao==="assinada"&&a.situacaoEntrevista==="a_fazer"&&!a.reuniaoEm){
      etapa="entrevista";motivo="Contrato assinado, pré-atendimento ainda não concluído.";acao="Concluir o pré-atendimento";
      mensagem=`Olá, ${pn}! Tudo bem? Agora que o contrato está assinado, precisamos concluir seu pré-atendimento. Você prefere uma ligação em horário disponível ou continuar por mensagem?`;
    }else if(a.situacaoContratacao==="assinada"&&a.situacaoMinuta==="protocolada"){
      etapa="acompanhamento";motivo="Processo protocolado: manter o cliente informado.";acao="Dar notícias ao cliente";
      mensagem=`Olá, ${pn}! Tudo bem? Passando para te atualizar sobre o seu processo: por enquanto estamos aguardando o andamento. Assim que houver novidade, avisamos você.`;
    }else if(a.situacaoContratacao==="assinada"&&a.situacaoDocumentos!=="conferidos"&&pend>0){
      etapa="documentos";motivo=`${pend} documento(s) ainda pendente(s) ou com correção.`;acao=`Cobrar ${pend} documento(s)`;
      mensagem=`Olá, ${pn}! Tudo bem? Para conseguirmos avançar com o seu caso, ainda precisamos de alguns documentos. Consegue nos enviar nesta semana? Se tiver dificuldade para encontrar algum, é só avisar que ajudamos.`;
    }
  }
  if(!etapa)return null;
  const vence=a.followupEm?ms(a.followupEm):venceFixo!=null?venceFixo:ms(ultimo||fallback)+PADRAO[etapa]*60000;
  return{id:a.id,cliente:a.nome,telefone:a.telefone,etapa,acao,motivo,venceEm:new Date(vence),atrasoMin:Math.round((Date.now()-vence)/60000),mensagem};
}
const todosFollowups=()=>itens.filter(a=>a.situacaoMinuta==="nao_iniciada").map(a=>followupDe(a)).filter(Boolean).sort((x,y)=>y.atrasoMin-x.atrasoMin);
/* fluxo do caso */
function obrigatorias(a){const e=[];if(a.triagem!=="viavel")e.push("Concluir a triagem como viável");if(a.situacaoContratacao!=="assinada")e.push("Confirmar contrato assinado");return e}
function pendencias(a){
  const e=obrigatorias(a).slice();
  const respondeu=Object.values(a.ficha.respostas||{}).some(v=>String(v==null?"":v).trim());
  if(a.situacaoEntrevista!=="ficha_revisada"||!a.ficha.revisada||!respondeu)e.push("Preencher e revisar o pré-atendimento");
  if(a.situacaoDocumentos!=="conferidos"||!a.docs.length||a.docs.some(d=>!(d.situacao==="conferido"||d.situacao==="dispensado")))e.push("Conferir administrativamente todos os documentos do checklist");
  return e;
}
const avisosJur=a=>{const f=obrigatorias(a);return pendencias(a).filter(p=>!f.includes(p))};
/* abas do atendimento */
const PASSOS=[["triagem","Triagem"],["contrato","Contrato"],["entrevista","Pré-atendimento"],["documentos","Documentos"],["minuta","Fluxo do caso"],["followup","Acompanhamento"]];
function statusPasso(a,aba){
  const v=a.triagem==="viavel";
  switch(aba){
    case"triagem":return v?"feita":"atual";
    case"contrato":if(a.situacaoContratacao==="assinada")return"feita";return v&&(a.situacaoContratacao==="proposta_enviada"||a.situacaoContratacao==="aguardando_assinatura")?"atual":"pendente";
    case"entrevista":if(a.situacaoEntrevista==="realizada"||a.situacaoEntrevista==="ficha_revisada")return"feita";return v&&a.situacaoEntrevista==="agendada"?"atual":"pendente";
    case"documentos":if(a.situacaoDocumentos==="conferidos")return"feita";return v&&a.situacaoContratacao==="assinada"?"atual":"pendente";
    case"minuta":if(a.situacaoMinuta!=="nao_iniciada")return"feita";return v&&a.situacaoContratacao==="assinada"&&a.situacaoDocumentos==="conferidos"?"atual":"pendente";
    case"followup":return a.situacaoMinuta==="protocolada"?"atual":"pendente";
  }return"pendente";
}
function abaAtual(a){
  if(a.triagem!=="viavel")return"triagem";
  if(a.situacaoMinuta==="protocolada")return"followup";
  if(a.situacaoContratacao==="proposta_enviada"||a.situacaoContratacao==="aguardando_assinatura")return"contrato";
  if(a.situacaoEntrevista==="a_fazer"||a.situacaoEntrevista==="agendada")return"entrevista";
  if(a.situacaoContratacao!=="assinada")return"contrato";
  if(a.situacaoDocumentos!=="conferidos")return"documentos";
  return"minuta";
}

/* ---------- peças de interface ---------- */
const badge=(t,v)=>`<span class="badge ${v||"secondary"}">${esc(t)}</span>`;
const opts=(m,sel)=>Object.keys(m).map(k=>`<option value="${esc(k)}" ${k===sel?"selected":""}>${esc(m[k])}</option>`).join("");
const cabecalho=(titulo,sub,acoes)=>`<header class="cab"><div><div class="eyebrow">JS ADVOCACIA · CENTRAL OPERACIONAL</div><h1>${esc(titulo)}</h1>${sub?`<p>${esc(sub)}</p>`:""}</div>${acoes?`<div class="acoes">${acoes}</div>`:""}</header>`;
const tabsH=(lista,atual,chave)=>`<div class="tabs" role="tablist">${lista.map(([k,t,extra])=>`<button type="button" role="tab" class="${k===atual?"on":""}" data-act="${chave}" data-v="${k}">${esc(t)}${extra||""}</button>`).join("")}</div>`;
const filtraBusca=(a,t)=>!t||[a.nome,a.assunto,AREAS[a.area]||a.area,a.telefone||"",a.origem||""].some(v=>String(v).toLowerCase().includes(t));

/* ---------- páginas ---------- */
function listaIniciais(){
  const at=itens.filter(a=>!a.arquivado&&a.situacaoContratacao==="assinada"&&a.situacaoMinuta!=="protocolada");
  const g=(f)=>at.filter(f);
  const sem=g(a=>a.situacaoMinuta==="nao_iniciada");
  return[
   ["Aguardando documentos ou ficha do cliente",sem.filter(a=>infoPos(a).grupo!=="prontos"),a=>{const i=infoPos(a);return i.grupo==="docs"?`Documentos: ${i.ok} de ${i.tot||"?"} conferidos`:"Ficha para revisar"}],
   ["Prontos para enviar ao Jurídico",sem.filter(a=>infoPos(a).grupo==="prontos"),()=>"Cadastro, ficha e documentos em ordem"],
   ["No Jurídico, em elaboração ou análise",g(a=>a.situacaoMinuta==="minuta_gerada"||a.situacaoMinuta==="em_revisao"),a=>R_MINUTA[a.situacaoMinuta]],
   ["Prontas para protocolar",g(a=>a.situacaoMinuta==="aprovada"),()=>"Aprovada pelo Jurídico"]];
}
function painelIniciais(){
  const gr=listaIniciais();const tot=gr.reduce((n,x)=>n+x[1].length,0);
  return `<div class="cardL"><h2>Iniciais pendentes (${tot})</h2><p class="nota">Casos com contrato assinado cuja peça inicial ainda não foi protocolada.</p>
  ${gr.map(([t,l,sub])=>`<h3 class="sec">${t} (${l.length})</h3>${l.length?l.map(a=>`<div class="tarefa"><div><a href="#" data-go="/atendimento/${a.id}"><strong>${esc(a.nome)}</strong></a><div class="nota">${esc(sub(a))} · ${esc(AREAS[a.area]||"")}${a.assunto?" · "+esc(a.assunto):""}</div></div></div>`).join(""):`<p class="nota">Nenhum.</p>`}`).join("")}</div>`;
}
function listaAguardandoCliente(){
  const at=itens.filter(a=>!a.arquivado);const l=[];
  at.filter(a=>a.triagem==="viavel"&&a.situacaoContratacao==="aguardando_assinatura").forEach(a=>l.push({a,t:"Contrato aguardando assinatura"}));
  at.filter(a=>a.situacaoContratacao==="assinada"&&a.situacaoMinuta==="nao_iniciada").forEach(a=>{const i=infoPos(a);if(i.grupo==="docs")l.push({a,t:`Documentos: ${i.ok} de ${i.tot||"?"} conferidos`});else if(i.grupo==="ficha")l.push({a,t:"Ficha para revisar"})});
  return l;
}
function pgHoje(){
  const hoje=hojeIso();
  const fus=todosFollowups();const devidos=fus.filter(f=>f.atrasoMin>=0);
  const tarefas=[];itens.forEach(a=>a.tarefas.forEach(t=>{if(t.situacao!=="concluida"&&t.data&&t.data<=hoje)tarefas.push({a,t})}));
  const reunioes=itens.filter(a=>a.reuniaoEm&&a.situacaoEntrevista!=="realizada"&&a.situacaoEntrevista!=="ficha_revisada"&&String(a.reuniaoEm).slice(0,10)===hoje);
  const aguard=listaAguardandoCliente();
  const nIni=listaIniciais().reduce((n,x)=>n+x[1].length,0);
  const sel=ui.hojeCard||"prazo";
  const card=(k,n,rot,al)=>`<button type="button" class="kpi kpib ${al?"al":""} ${sel===k?"on":""}" data-act="hojeCard" data-v="${k}"><b>${n}</b><span>${rot}</span></button>`;
  const np=prazos.est==="ok"?prazosDoDia("prazo").devidos.length:"-";
  const na=prazos.est==="ok"?prazosDoDia("aud").devidos.length:"-";
  const nAudTot=prazos.est==="ok"?prazosDoDia("aud").devidos.length+prazosDoDia("aud").prox.length:"-";
  let painel="";
  if(sel==="ini")painel=painelIniciais();
  else if(sel==="prazo")painel=blocoHoje("prazo");
  else if(sel==="aud")painel=blocoHoje("aud");
  else if(sel==="pub")painel=blocoPubs();
  else if(sel==="ret")painel=`<div class="cardL"><h2>Retornos a clientes (${devidos.length})</h2>${devidos.length?devidos.map(fuLinha).join(""):`<p class="nota">${carregou?"Nenhum retorno pendente. Tudo em dia.":"Carregando..."}</p>`}</div>`;
  else if(sel==="aguard")painel=`<div class="cardL"><h2>Aguardando o cliente (${aguard.length})</h2>${aguard.length?aguard.map(({a,t})=>`<div class="tarefa"><div><a href="#" data-go="/atendimento/${a.id}"><strong>${esc(a.nome)}</strong></a><div class="nota">${esc(t)} · ${esc(AREAS[a.area]||"")}</div></div></div>`).join(""):`<p class="nota">${carregou?"Ninguém pendente com o cliente.":"Carregando..."}</p>`}</div>`;
  else painel=`<div class="cardL"><h2>Tarefas para hoje (${tarefas.length})</h2>${tarefas.length?tarefas.map(({a,t})=>`<div class="tarefa"><div><strong>${esc(t.titulo)}</strong><div class="nota"><a href="#" data-go="/atendimento/${a.id}">${esc(a.nome)}</a> · <span class="${t.data<hoje?"atrasada":""}">${dataBr(t.data)}${t.data<hoje?" (atrasada)":""}</span></div></div><button class="btn sm outline" data-act="concluirTarefa" data-id="${a.id}" data-t="${t.id}">Concluir</button></div>`).join(""):`<p class="nota">Nenhuma tarefa para hoje.</p>`}</div>
  ${reunioes.length?`<div class="cardL"><h2>Reuniões de hoje (${reunioes.length})</h2>${reunioes.map(a=>`<div class="tarefa"><div><strong>${esc(a.nome)}</strong><div class="nota">${fmtR(a.reuniaoEm)} · ${esc(AREAS[a.area]||"")}</div></div><button class="btn sm outline" data-go="/atendimento/${a.id}">Abrir</button></div>`).join("")}</div>`:""}`;
  return cabecalho("Hoje","Clique em um quadro para ver o que há nele.")+`
  <div class="kpis">
   ${card("ini",nIni,"Iniciais pendentes",nIni>0)}
   ${card("prazo",np,"Prazos do dia",np>0)}
   ${card("aud",nAudTot,"Audiências e perícias",na>0)}
   ${card("pub",pubs.est==="ok"?pubs.total:"-","Publicações não lidas",pubs.est==="ok"&&pubs.total>0)}
   ${card("ret",devidos.length,"Retornos a clientes",devidos.length>0)}
   ${card("aguard",aguard.length,"Aguardando o cliente",false)}
   ${card("tar",tarefas.length+reunioes.length,"Tarefas e reuniões de hoje",false)}
  </div>
  ${painel}`;
}
function fuLinha(f){
  const op=OPC_FU[f.etapa];
  return `<div class="fu ${f.atrasoMin>0?"at":""}"><div class="t"><div><a href="#" data-go="/atendimento/${f.id}">${esc(f.cliente)}</a><div class="nota">${ROT_FU[f.etapa]}</div></div><span class="${f.atrasoMin>0?"atrasada":"nota"}">${textoPrazo(f.atrasoMin)}</span></div>
  <div style="margin-top:.25rem"><strong style="font-size:.9rem">${esc(f.acao)}</strong></div><div class="nota">${esc(f.motivo)}</div>${fuAcoes(f,false)}</div>`;
}
function fuAcoes(f,comMsg){
  const op=OPC_FU[f.etapa];
  const rotMin=m=>m<60?m+" min":m<2880?"1 dia":Math.round(m/1440)+" dias";
  return `<div class="fuacoes">${op?`<span class="rotulo">Fiz contato, voltar em:</span>${op.map(([m,r])=>`<button class="btn sm outline" data-act="registrarContato" data-id="${f.id}" data-m="${m}">${r}</button>`).join("")}`:`<button class="btn sm" data-act="registrarContato" data-id="${f.id}" data-m="${PADRAO[f.etapa]}">Registrei contato (volta em ${rotMin(PADRAO[f.etapa])})</button>`}
  <button class="btn sm ghost" data-act="verMensagens" data-id="${f.id}">Ver modelos de mensagem</button></div>`;
}

function pgComercial(){
  const fus=todosFollowups();
  let corpo="";
  if(ui.comTab==="retornos")corpo=comRetornos(fus);else corpo=comFluxo();
  return cabecalho("Comercial","Leads, atendimentos, contratação e documentos até o envio ao Jurídico")
   +tabsH([["fluxo","Fluxo comercial"],["retornos","Retornos",fus.filter(f=>f.atrasoMin>=0).length?` <span class="badge warning">${fus.filter(f=>f.atrasoMin>=0).length}</span>`:""]],ui.comTab,"comTab")
   +`<div class="painel">${corpo}</div>`;
}
function comRetornos(fus){
  const dev=fus.filter(f=>f.atrasoMin>=0),prox=fus.filter(f=>f.atrasoMin<0);
  return `<div class="cardL"><h2>Para fazer agora e atrasados (${dev.length})</h2>${dev.length?dev.map(fuLinha).join(""):`<p class="nota">Nenhum follow-up pendente. Tudo em dia.</p>`}</div>
  ${prox.length?`<div class="cardL"><h2>Próximos (${prox.length})</h2>${prox.map(fuLinha).join("")}</div>`:""}
  <div class="cardL"><h2>Como funciona</h2><ul class="nota" style="line-height:1.7;margin:0;padding-left:1.2rem"><li>Triagem (lead sem resposta): você escolhe o retorno, de 30 minutos a 30 dias. Padrão: 1 dia.</li><li>Pré-atendimento: você escolhe de 1 dia a 30 dias. Se houver ligação marcada, vale a data combinada.</li><li>Contrato não assinado: todo dia.</li><li>Documentos pendentes: todo dia.</li><li>Processo protocolado: a cada 30 dias, para manter o cliente informado.</li></ul></div>`;
}
function calc(){
  const todos=itens.filter(a=>(!ui.fResp||a.responsavel===ui.fResp)&&(!ui.fArea||a.area===ui.fArea));const ativos=todos.filter(a=>!a.arquivado&&a.situacaoMinuta==="nao_iniciada");
  const triagem=ativos.filter(a=>a.triagem==="em_triagem"),futuro=ativos.filter(a=>a.triagem==="talvez_futuro"),inviaveis=ativos.filter(a=>a.triagem==="inviavel");
  const andamento=ativos.filter(a=>a.triagem==="viavel"&&a.situacaoContratacao!=="nao_fechou"&&a.situacaoMinuta!=="protocolada");
  const contratos=andamento.filter(a=>["proposta_enviada","aguardando_assinatura"].includes(a.situacaoContratacao));
  const comFalta=andamento.filter(a=>docsPend(a)>0);
  const prontos=andamento.filter(a=>a.situacaoEntrevista==="ficha_revisada"&&a.situacaoContratacao==="assinada"&&a.situacaoDocumentos==="conferidos"&&a.situacaoMinuta==="nao_iniciada");
  const arquivados=todos.filter(a=>a.arquivado);
  const tarefas=[];todos.forEach(a=>a.tarefas.forEach(t=>{if(t.situacao!=="concluida")tarefas.push({a,t})}));
  return{ativos,triagem,futuro,inviaveis,andamento,contratos,comFalta,prontos,arquivados,tarefas};
}
const CHIPS=[["triagem","Triagem"],["andamento","Em andamento"],["contratos","Contrato pendente"],["docs","Documentos faltando"],["prontos","Prontos para enviar ao Jurídico"],["futuro","Talvez no futuro"],["inviaveis","Inviáveis"],["todos","Todos"],["arquivados","Arquivados"]];
const PRINC=["andamento","triagem","docs","prontos","todos"];
function filtrosCom(){
  const resp=[...new Set([...PESSOAS,...itens.map(a=>a.responsavel).filter(Boolean)])];
  return `<select data-cf="resp" style="width:auto;min-width:150px" aria-label="Responsável"><option value="">Todos os responsáveis</option>${resp.map(r=>`<option ${ui.fResp===r?"selected":""}>${esc(r)}</option>`).join("")}</select>
  <select data-cf="area" style="width:auto;min-width:150px" aria-label="Área"><option value="">Todas as áreas</option>${Object.entries(AREAS).map(([k,v])=>`<option value="${k}" ${ui.fArea===k?"selected":""}>${v}</option>`).join("")}</select>`;
}
function comFluxo(){
  const c=calc();const hoje=hojeIso();
  const tarefasHoje=c.tarefas.filter(({t})=>t.data&&t.data<=hoje).length;
  const barra=`<div class="acoes" style="margin-bottom:.75rem"><button class="btn" data-act="novoLead">${ico("mais",16)} Novo lead</button>${filtrosCom()}</div>`;
  const vis=`<div class="tabs">${[["atendimentos","Lista"],["etapas","Fluxo"],["tarefas","Tarefas do Comercial"]].map(([k,t])=>`<button type="button" class="${ui.visao===k?"on":""}" data-act="visao" data-v="${k}">${t}${k==="tarefas"&&tarefasHoje?` <span class="badge warning">${tarefasHoje} p/ hoje</span>`:""}</button>`).join("")}</div>`;
  let corpo="";
  const t=ui.busca.trim().toLowerCase();
  const buscaH=`<div class="busca">${ico("busca",16)}<input type="search" id="busca" value="${esc(ui.busca)}" placeholder="Buscar por cliente ou assunto..."></div>`;
  if(ui.visao==="atendimentos"){
    const base={triagem:c.triagem,andamento:c.andamento,contratos:c.contratos,docs:c.comFalta,prontos:c.prontos,futuro:c.futuro,inviaveis:c.inviaveis,todos:c.ativos,arquivados:c.arquivados}[ui.filtro]||[];
    const lista=base.filter(a=>filtraBusca(a,t));
    const n={triagem:c.triagem.length,andamento:c.andamento.length,contratos:c.contratos.length,docs:c.comFalta.length,prontos:c.prontos.length,futuro:c.futuro.length,inviaveis:c.inviaveis.length,todos:c.ativos.length,arquivados:c.arquivados.length};
    const outros=CHIPS.filter(([f])=>!PRINC.includes(f));
    corpo=`<div class="chips">${CHIPS.filter(([f])=>PRINC.includes(f)).map(([f,r])=>`<button type="button" class="chip ${ui.filtro===f?"on":""}" data-act="filtro" data-v="${f}">${r} <strong>${n[f]}</strong></button>`).join("")}
      <select id="maisFiltros" style="width:auto;min-width:150px"><option value="">${PRINC.includes(ui.filtro)?"Mais filtros":esc((CHIPS.find(x=>x[0]===ui.filtro)||[])[1])}</option>${outros.map(([f,r])=>`<option value="${f}" ${ui.filtro===f?"selected":""}>${r} (${n[f]})</option>`).join("")}</select></div>${buscaH}
      <div class="tabwrap"><table><thead><tr><th>Cliente</th><th>Próximo passo</th><th>Pré-atendimento</th><th>Contrato</th><th>Documentos</th><th>Envio ao Jurídico</th></tr></thead><tbody>
      ${lista.length===0?`<tr><td colspan="6" class="vazio">${itens.length===0?(carregou?"Nenhum atendimento ainda. Clique em Novo lead.":"Carregando..."):"Nenhum atendimento neste filtro."}</td></tr>`:""}
      ${lista.map(a=>{const p=proximoPasso(a);const sub=[AREAS[a.area],a.assunto,a.origem,a.triagem==="viavel"&&a.reuniaoEm&&a.situacaoEntrevista==="agendada"?"Reunião "+fmtR(a.reuniaoEm):null,a.triagem==="em_triagem"?a.telefone:null].filter(Boolean).join(" · ");
       return `<tr class="linha" data-go="/atendimento/${a.id}"><td><strong>${esc(a.nome)}</strong><div class="nota">${esc(sub)}</div></td><td>${badge(p.texto,tomBadge(p.tom))}</td>
       <td class="${a.situacaoEntrevista==="ficha_revisada"?"feito":"pend"}">${rot(R_ENTREV,a.situacaoEntrevista)}</td><td class="${a.situacaoContratacao==="assinada"?"feito":"pend"}">${rot(R_CONTR,a.situacaoContratacao)}</td>
       <td class="${a.situacaoDocumentos==="conferidos"?"feito":"pend"}">${rot(R_DOCS,a.situacaoDocumentos)}</td><td class="${a.situacaoMinuta!=="nao_iniciada"?"feito":"pend"}">${rot(R_MINUTA,a.situacaoMinuta)}</td></tr>`}).join("")}
      </tbody></table></div>`;
  }else if(ui.visao==="etapas"){
    corpo=buscaH+`<div class="colunas">${COLUNAS.map(col=>{
      const its=c.ativos.filter(a=>etapaCol(a)===col.e).filter(a=>filtraBusca(a,t));
      return `<section class="coluna"><header class="colunaTopo"><div><div class="colunaGrupo">${col.g}</div><strong>${col.r}</strong></div>${badge(its.length,"secondary")}</header>
      ${its.length===0?`<p class="nota" style="margin:0">Ninguém nesta etapa.</p>`:""}
      ${its.map(a=>{const fu=followupDe(a);return `<a class="cartao" href="#" data-go="/atendimento/${a.id}"><strong>${esc(a.nome)}</strong><div class="nota">${esc([AREAS[a.area],a.assunto].filter(Boolean).join(" · "))}</div>${fu?badge(textoPrazo(fu.atrasoMin),fu.atrasoMin>0?"warning":"outline"):""}</a>`}).join("")}</section>`}).join("")}</div>`;
  }else{
    const ab=[...c.tarefas].sort((x,y)=>(x.t.data||"9999").localeCompare(y.t.data||"9999"));
    corpo=ab.length===0?`<p class="vazio">Nenhuma tarefa aberta. Crie tarefas dentro de cada atendimento.</p>`:ab.map(({a,t})=>`<div class="tarefa"><div><strong>${esc(t.titulo)}</strong><div class="nota"><a href="#" data-go="/atendimento/${a.id}">${esc(a.nome)}</a> · <span class="${t.data&&t.data<hoje?"atrasada":""}">${dataBr(t.data)}${t.data&&t.data<hoje?" (atrasada)":""}</span> · ${rot(R_TAREFA,t.situacao)}${a.responsavel?" · "+esc(a.responsavel):""}</div></div><button class="btn sm outline" data-act="concluirTarefa" data-id="${a.id}" data-t="${t.id}">Concluir</button></div>`).join("");
  }
  return barra+vis+`<div class="painel">${corpo}</div>`;
}

/* ----- Atendimento ----- */
function pgAtendimento(id){
  const a=porId(id);
  if(!a)return carregou?`<p>Atendimento não encontrado.</p><a class="btn outline" href="#" data-go="/comercial">Voltar</a>`:`<p class="nota">Carregando...</p>`;
  const pend=docsPend(a);const viavel=a.triagem==="viavel",assinado=a.situacaoContratacao==="assinada";
  const preparando=viavel&&assinado&&!a.arquivado&&a.situacaoMinuta==="nao_iniciada";
  const faltas=avisosJur(a);const faltaEntrev=faltas.includes("Preencher e revisar o pré-atendimento");
  const passo=proximoPasso(a);
  const nomeEntrev=assinado?"Entrevista pós-contrato":"Pré-atendimento";
  const fu=followupDe(a);
  const proximaAcao=!preparando?passo.texto:faltaEntrev?(a.reuniaoEm?"Realizar entrevista agendada":"Preencher e revisar o pré-atendimento"):faltas.length?"Conferir documentos":"Enviar ao Jurídico";
  const recomendada=preparando?(faltaEntrev?"entrevista":faltas.length?"documentos":"minuta"):abaAtual(a);
  const aba=ui.abaAt||recomendada;
  const rotRec=recomendada==="entrevista"?nomeEntrev:(PASSOS.find(p=>p[0]===recomendada)||[])[1]||"";
  const link=(u=>{u=(u||"").trim();return u?(/^https?:\/\//i.test(u)?u:"https://"+u):null})(a.pastaDrive);
  const tabsAt=[["triagem","Triagem"],["contrato","Contrato"],["entrevista",nomeEntrev],["documentos","Documentos",pend?` <span class="badge warning">${pend} pendente(s)</span>`:""],["minuta","Fluxo do caso"],["followup","Follow-up"],["tarefas","Tarefas ("+a.tarefas.filter(t=>t.situacao!=="concluida").length+")"],["obs","Observações"],["historico","Histórico"]];
  const respondeu=Object.values(a.ficha.respostas||{}).some(v=>String(v==null?"":v).trim());
  const aguardaEntrevista=preparando&&faltaEntrev&&!respondeu&&!a.reuniaoEm;
  let btnJur="";
  if(a.situacaoMinuta==="nao_iniciada"&&viavel&&assinado)btnJur=`<button class="btn sm" data-act="abrirAba" data-v="minuta">Enviar ao Jurídico</button>`;
  const cab=`<a class="voltar" href="#" data-go="/comercial">${ico("voltar",14)} Atendimentos</a>
  <header class="cabAt"><div><h1>${esc(a.nome)}</h1><div class="sub">${badge(AREAS[a.area]||a.area,"outline")}${badge("Próximo: "+proximaAcao,tomBadge(passo.tom))}${a.arquivado?badge("Arquivado","secondary"):""}</div></div>
   <div class="acoes">${link?`<a class="btn outline" href="${esc(link)}" target="_blank" rel="noopener noreferrer">${ico("pasta",14)} Pasta no Drive</a>`:""}
   <button class="btn outline" data-act="copiarMinuta">${ico("arquivo",14)} Copiar para a minuta</button>
   <button class="btn outline" data-act="arquivar">${a.arquivado?"Reabrir":"Arquivar"}</button>
   <button class="btn ghost" data-act="excluir">${ui.confirmaExcluir===a.id?"Confirmar exclusão":"Excluir"}</button></div></header>`;
  const stepper=`<nav class="stepper" aria-label="Etapas do atendimento">${PASSOS.map(([k,r],i)=>{const st=statusPasso(a,k);return `<button type="button" class="passo ${st} ${aba===k?"sel":""}" data-act="abrirAba" data-v="${k}"><span class="bolinha">${st==="feita"?ico("check",12):i+1}</span><span>${k==="entrevista"?nomeEntrev:r}</span></button>`}).join("")}</nav>`;
  const mostrarIr=aba!==recomendada||(preparando&&faltaEntrev&&!respondeu);
  const agora=`<section class="agora"><div class="agoraTopo"><div><span class="rotulo">O que fazer agora</span><div class="agoraTexto">${esc(proximaAcao)}</div>${preparando&&aguardaEntrevista?`<p class="nota" style="margin:.25rem 0 0">Entrevista ainda sem resposta.</p>`:""}</div>
   <div class="acoes">${!viavel&&a.triagem!=="inviavel"?`<button class="btn sm" data-act="setTriagem" data-v="viavel">Marcar como viável</button>`:""}${(!preparando||!faltas.length)?btnJur:""}${mostrarIr?`<button class="btn sm outline" data-act="abrirAba" data-v="${recomendada}">Ir para ${esc(rotRec)}</button>`:""}</div></div>
   ${fu&&!(preparando&&faltaEntrev)?`<div class="followup"><h3>Follow-up: ${esc(fu.acao)}</h3><p class="nota" style="margin:0 0 .25rem">${esc(fu.motivo)}</p><div class="nota">${textoPrazo(fu.atrasoMin)} · ${fmtDH(fu.venceEm)}</div>${fuAcoes(fu,true)}</div>`:(!preparando?`<p class="nota" style="margin:0">Sem follow-up programado neste momento.</p>`:"")}</section>`;
  const dados=`<section class="dados"><label class="campo"><span class="rotulo">Assunto</span><input type="text" data-blur="assunto" value="${esc(a.assunto)}" placeholder="Ex.: rescisão indireta"></label>
   <label class="campo"><span class="rotulo">Responsável comercial</span><input type="text" data-blur="responsavel" value="${esc(a.responsavel)}" placeholder="Quem cuida"></label>
   <label class="campo"><span class="rotulo">Pasta do caso no Drive (cole o link)</span><div class="linhaLink"><input type="text" data-blur="pastaDrive" value="${esc(a.pastaDrive)}" placeholder="https://drive.google.com/...">${link?`<a class="btn outline" href="${esc(link)}" target="_blank" rel="noopener noreferrer">${ico("externo",14)} Abrir</a>`:""}</div></label></section>`;
  return cab+stepper+agora+dados+tabsH(tabsAt,aba,"abrirAba2")+`<div class="painel" id="abaCorpo">${abaCorpo(a,aba,{viavel,assinado,pend,preparando,faltas,fu,nomeEntrev})}</div>`;
}
const avisoTriagem=a=>`<div class="bloqueio"><p>Esta etapa fica disponível quando a triagem estiver como Viável. Hoje está como "${rot(R_TRIAGEM,a.triagem)}".</p><div class="acoes"><button class="btn sm" data-act="setTriagem" data-v="viavel">Marcar como viável</button><button class="btn sm outline" data-act="abrirAba" data-v="triagem">Ir para a triagem</button></div></div>`;
const sit=(rotulo,campo,m,val)=>`<div class="campo"><span class="rotulo">${rotulo}</span><select data-chg="${campo}">${opts(m,val)}</select></div>`;
function abaCorpo(a,aba,c){
  switch(aba){
    case"triagem":{
      const CAD=[["nome","Nome"],["cpf","CPF"],["rg","RG"],["nacionalidade","Nacionalidade"],["sexo","Sexo"],["nascimento","Nascimento"],["estadoCivil","Estado civil"],["profissao","Profissão"],["mae","Nome da mãe"],["telefone","Telefone"],["email","E-mail"],["endereco","Endereço"],["email","E-mail"]];
      const val=k=>k==="nome"?a.nome:k==="telefone"?a.telefone:(a.cadastro[k]||"");
      return `<section class="caixa"><div class="linha3">${sit("Triagem","triagem",R_TRIAGEM,a.triagem)}
        <div class="campo"><span class="rotulo">De onde veio</span><select data-chg="origem"><option value="">Não informada</option>${ORIGENS.map(o=>`<option ${o===a.origem?"selected":""}>${o}</option>`).join("")}${a.origem&&!ORIGENS.includes(a.origem)?`<option selected>${esc(a.origem)}</option>`:""}</select></div>
        ${a.triagem==="talvez_futuro"?`<label class="campo"><span class="rotulo">Retomar contato em</span><input type="date" data-blur="retomarEm" value="${esc(a.retomarEm)}"></label>`:""}
        <div class="campo"><span class="rotulo">Área</span><select data-chg="area">${opts(AREAS,a.area)}</select></div></div>
        <label class="campo"><span class="rotulo">${a.triagem==="inviavel"?"Por que é inviável":a.triagem==="talvez_futuro"?"O que precisa acontecer para virar cliente":"Anotações da triagem"}</span><textarea rows="3" data-blur="triagemNotas" placeholder="O que o contato contou, se há prazo correndo, o que pesou na decisão...">${esc(a.triagemNotas)}</textarea></label></section>
        <h3 class="sec">Cadastro do cliente</h3><p class="nota">Dados para o contrato e a procuração. O cliente fica como contato até o contrato ser marcado como assinado.</p>
        <div class="linha3">${CAD.map(([k,r])=>`<label class="campo"><span class="rotulo">${r}</span><input type="text" data-blurcad="${k}" value="${esc(val(k))}"></label>`).join("")}</div>`;}
    case"contrato":
      if(!c.viavel)return avisoTriagem(a);
      return blocoEncerrado(a)+blocoKit(a)+blocoAssinatura(a)+blocoPosContrato(a);
    case"entrevista":
      if(!c.viavel)return avisoTriagem(a);
      return entrevistaH(a);
    case"documentos":{
      if(!c.viavel)return avisoTriagem(a);
      return `<div class="etapaCampos">${sit("Situação dos documentos","situacaoDocumentos",R_DOCS,a.situacaoDocumentos)}</div>
       ${a.situacaoContratacao!=="assinada"?`<p class="nota">Aviso: o contrato ainda não está marcado como assinado. Você pode seguir mesmo assim.</p>`:""}
       <div style="margin-top:.75rem"><h3 class="h3">Checklist (o que pedir e conferir)</h3>
       ${a.docs.length?`<div class="acoes" style="margin-bottom:.5rem"><button class="btn sm outline" data-act="docsTodos" data-v="conferido" ${a.docs.every(d=>d.situacao==="conferido")?"disabled":""}>${ico("check",14)} Marcar todos como conferidos</button><button class="btn sm ghost" data-act="docsTodos" data-v="solicitado" ${a.docs.every(d=>d.situacao==="solicitado")?"disabled":""}>Desmarcar todos</button></div>`:""}
       ${a.docs.map(d=>linhaDoc(a,d)).join("")}
       ${a.docs.length===0?`<p class="nota">Nenhum item no checklist.</p>`:""}
       <div class="linhaLink"><input type="text" id="novoDoc" placeholder="Novo documento a pedir"><button class="btn outline" data-act="docAdd">${ico("mais",14)} Incluir</button></div>
       ${a.docs.length===0?`<div class="acoes" style="margin-top:.5rem"><button class="btn sm outline" data-act="criarChecklist">Criar checklist sugerido (${esc(tipoDemandaDe(a)||AREAS[a.area])})</button></div>`:`<div class="acoes" style="margin-top:.5rem"><button class="btn sm ghost" data-act="posAplicarDocs">Acrescentar itens do tipo de demanda</button></div>`}</div>`;}
    case"minuta":return fluxoCaso(a);
    case"followup":{
      const fu=c.fu;
      return fu?`<div class="cardL"><h2>${esc(fu.acao)}</h2><p class="nota">${esc(fu.motivo)}</p><label class="campo"><span class="rotulo">Mensagem sugerida (pode editar)</span><textarea id="fuMsg" rows="5">${esc(fu.mensagem)}</textarea></label>
        <div class="acoes" style="margin-top:.5rem"><button class="btn" data-act="copiarFu">Copiar</button><a class="btn outline" id="fuWa" target="_blank" rel="noopener noreferrer" href="${esc(MSG.linkWhatsapp(a.telefone||"",fu.mensagem))}">Abrir no WhatsApp</a><button class="btn ghost" data-act="verMensagens" data-id="${a.id}">Mais modelos na Biblioteca</button></div>${fuAcoes(fu,true)}</div>`
       :`<p class="nota">Sem follow-up programado neste momento.</p><button class="btn outline" data-act="verMensagens" data-id="${a.id}">Ver mensagens prontas</button>`;}
    case"obs":return `<p class="nota">Anotações livres sobre o caso. Salvam ao sair do campo.</p><textarea rows="8" data-blur="observacoes">${esc(a.observacoes)}</textarea>`;
    case"tarefas":return a.tarefas.map(t=>`<div class="item"><span class="itemNome">${esc(t.titulo)} ${t.data?badge(dataBr(t.data),"outline"):""}</span><select class="selPeq" data-tarsel="${t.id}">${opts(R_TAREFA,t.situacao)}</select><button class="btn ghost sm ico" aria-label="Remover tarefa" data-act="tarRem" data-t="${t.id}">${ico("lixo",14)}</button></div>`).join("")
      +(a.tarefas.length?"":`<p class="nota">Nenhuma tarefa neste atendimento.</p>`)
      +`<div class="linhaLink"><input type="text" id="novaTar" placeholder="Nova tarefa"><input type="date" id="novaTarData" style="max-width:10rem"><button class="btn outline" data-act="tarAdd">${ico("mais",14)} Incluir</button></div>`;
    case"historico":return (a.historico.length?"":`<p class="nota">Sem registros.</p>`)+`<ul class="historico">${[...a.historico].reverse().map(h=>`<li><span class="nota">${fmtDHL(h.em)}</span><div>${esc(h.texto)}</div></li>`).join("")}</ul>`;
  }return"";
}
/* pré-atendimento (ficha) */
function entrevistaH(a){
  const perg=FICHA.f[a.area]||[];const resp=a.ficha.respostas||{};
  const assuntos=[...new Set(perg.map(p=>p.assunto).filter(Boolean))];
  const ativos=a.ficha.assuntos||[];
  const vis=perg.filter(p=>!p.assunto||ativos.includes(p.assunto));
  const secoes=[...new Set(vis.map(p=>p.secao))];
  const preench=Object.values(resp).some(v=>String(v==null?"":v).trim());
  const rev=a.situacaoEntrevista==="ficha_revisada"||a.ficha.revisada;
  let reuniao="";
  if(a.reuniaoEm){const q=parseR(a.reuniaoEm);const dif=q.getTime()-Date.now();const abs=Math.abs(dif);const d=Math.floor(abs/864e5),h=Math.floor(abs%864e5/36e5),m=Math.floor(abs%36e5/6e4);const partes=d>0?`${d} dia(s) e ${h} h`:h>0?`${h} h e ${m} min`:`${m} min`;
    reuniao=`<div class="nota">${badge("Reunião agendada",dif>=0?"success":"warning")} <strong>${q.toLocaleDateString("pt-BR",{timeZone:TZ})}</strong> às <strong>${q.toLocaleTimeString("pt-BR",{timeZone:TZ,hour:"2-digit",minute:"2-digit"})}</strong> (${q.toLocaleDateString("pt-BR",{timeZone:TZ,weekday:"long"})}) · ${dif>=0?"faltam "+partes:"já passou há "+partes}.</div>`}
  const campoP=p=>{
    const v=resp[p.id]||"";let inp="";
    if(p.tipo==="longo"||p.tipo==="familia")inp=`<textarea rows="${p.tipo==="familia"?4:3}" data-resp="${p.id}" ${p.tipo==="familia"?'placeholder="Um por linha: nome, parentesco, idade, renda"':""}>${esc(v)}</textarea>`;
    else if(p.tipo==="data")inp=`<input type="date" data-resp="${p.id}" value="${esc(v)}">`;
    else if(p.tipo==="sim_nao")inp=`<select data-resp="${p.id}"><option value=""></option>${["Sim","Não"].map(o=>`<option ${o===v?"selected":""}>${o}</option>`).join("")}</select>`;
    else if(p.tipo==="escolha")inp=`<select data-resp="${p.id}"><option value=""></option>${(p.opcoes||[]).map(o=>`<option ${o===v?"selected":""}>${esc(o)}</option>`).join("")}</select>`;
    else if(p.tipo==="multipla"){const sel=String(v).split(" | ").filter(Boolean);inp=`<div class="opcs">${(p.opcoes||[]).map(o=>`<label><input type="checkbox" data-multi="${p.id}" value="${esc(o)}" ${sel.includes(o)?"checked":""}> ${esc(o)}</label>`).join("")}</div>`}
    else inp=`<input type="text" data-resp="${p.id}" value="${esc(v)}">`;
    return `<div class="perg"><span>${esc(p.texto)}</span>${inp}</div>`;
  };
  return `${reuniao}${preench?`<p class="nota">${badge(rev?"Ficha revisada":"Ficha preenchida","secondary")} ${rev?"":"Esta etapa continua pendente até você revisar a ficha."}</p>`:""}
   <div class="etapaCampos">${sit("Situação do pré-atendimento","situacaoEntrevista",R_ENTREV,a.situacaoEntrevista)}<label class="campo"><span class="rotulo">Data do atendimento por ligação</span><input type="datetime-local" data-blur="reuniaoEm" value="${esc(a.reuniaoEm)}"></label></div>
   ${!a.reuniaoEm&&a.situacaoEntrevista==="a_fazer"?`<p class="nota">Se o cliente escolher ligação, registre aqui a data combinada. Se preferir mensagem, deixe sem data.</p>`:""}
   <h3 class="sec">Ficha de entrevista · ${AREAS[a.area]}</h3>
   ${assuntos.length?`<p class="nota" style="margin:0 0 .25rem">Assuntos do caso (abrem perguntas específicas):</p><div class="assuntos">${assuntos.map(s=>`<button type="button" class="chip ${ativos.includes(s)?"on":""}" data-act="assunto" data-v="${esc(s)}">${esc(s)}</button>`).join("")}</div>`:""}
   ${secoes.map(s=>`<h3 class="sec" style="font-size:.95rem">${esc(s)}</h3>${vis.filter(p=>p.secao===s).map(campoP).join("")}`).join("")}
   <div class="acoes" style="margin-top:1rem">${rev?`<button class="btn outline" data-act="reabrirFicha">Reabrir a ficha</button>`:`<button class="btn" data-act="revisarFicha">${ico("check",14)} Marcar ficha como revisada</button>`}</div>
   <p class="nota">As respostas salvam ao sair de cada campo. O envio da ficha ao cliente por link ainda será trazido para cá, em etapa à parte.</p>`;
}
/* fluxo do caso */
function fluxoCaso(a){
  if(a.situacaoMinuta!=="nao_iniciada")return blocoPrep(a);
  const obr=obrigatorias(a),av=avisosJur(a);
  const s=a.situacaoMinuta;
  let h=`<section class="pendencias"><p style="margin:0"><strong>Comercial → Jurídico → Revisão → Protocolo</strong></p><p style="margin:.4rem 0 0"><strong>Etapa: ${esc(rot(R_MINUTA,s))}</strong></p></section>`;
  if(s==="nao_iniciada"){
    if(obr.length){
      h+=`<div class="pendencias"><strong>Preparação pendente:</strong><ul>${obr.map(p=>{const k=p.includes("contrato")?"contrato":"triagem";return `<li><span>${p}</span><button class="btn sm outline" data-act="abrirAba" data-v="${k}">Resolver em ${k==="contrato"?"Contrato":"Triagem"}</button></li>`}).join("")}</ul></div>`;
    }else{
      {const bl=bloqueiosEnc(a);h+=bl.length?`<div class="pendencias"><strong>Impedem o encaminhamento ao Jurídico:</strong><ul>${bl.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><button class="btn sm outline" data-act="abrirAba" data-v="contrato">Resolver no Pós-contrato</button></div>`:`<p class="nota">Dossiê completo. Pronto para encaminhar.</p><button class="btn" data-act="posEncaminhar">Encaminhar ao Jurídico</button>`}
    }
  }else{
    const ult=[...a.historico].reverse().find(h=>/Jurídico|Jurídico:|protocol/i.test(h.texto));
    if(ult)h+=`<p class="nota">Último registro: ${esc(ult.texto)} (${fmtDHL(ult.em)})</p>`;
    h+=`<div class="acoes">`;
    if(s==="minuta_gerada")h+=`<button class="btn" data-act="jur" data-v="em_revisao">Concluir análise e iniciar produção</button>`;
    if(s==="em_revisao")h+=`<button class="btn" data-act="jur" data-v="aprovada">Minuta pronta para protocolo</button>`;
    if(s==="aprovada")h+=`<button class="btn" data-act="jur" data-v="protocolada">Registrar protocolo realizado</button>`;
    if(s!=="protocolada")h+=`<button class="btn outline" data-act="devolver">Devolver ao Pós-contrato (documentação)</button>`;
    h+=`</div>`;
    if(s==="protocolada")h+=`<p class="nota">Protocolo registrado. O follow-up passa a ser de acompanhamento (a cada 30 dias).</p>`;
  }
  return h;
}

/* ----- Jurídico, Clientes, Agenda, Biblioteca ----- */
/* ---------- kit de assinatura (modelos Word do escritório, no timbrado) ---------- */
const KITS={"Trabalhista":["trab_contrato","trab_proc","trab_hipo"],"Previdenciário":["prev_proc","prev_hipo","prev_renuncia","prev_residencia"],"Cível":["civ_contrato","civ_proc","civ_hipo"],"Defesa Empresarial":["emp_contrato","emp_proc"]};
const KIT_DA_AREA={trabalhista:"Trabalhista",previdenciario:"Previdenciário",civel:"Cível"};
const KIT_EXIGE={"Trabalhista":[["nome","Nome"],["cpf","CPF"],["nascimento","Data de nascimento"],["endereco","Endereço"],["email","E-mail"]],
 "Previdenciário":[["nome","Nome"],["cpf","CPF"],["nascimento","Data de nascimento"],["endereco","Endereço"],["estadoCivil","Estado civil"],["profissao","Profissão"],["email","E-mail"]],
 "Cível":[["nome","Nome"],["cpf","CPF"],["nascimento","Data de nascimento"],["endereco","Endereço"],["email","E-mail"]],
 "Defesa Empresarial":[["nome","Nome ou razão social"],["cpf","CPF ou CNPJ"],["endereco","Endereço"],["email","E-mail"]]};
const valCad=(a,k)=>k==="nome"?a.nome:k==="telefone"?a.telefone:(a.cadastro[k]||"");
const ACOES_PREV=[["bpc","BPC/LOAS"],["incap","Incapacidade (auxílio-doença / aposentadoria por invalidez)"],["aposent","Aposentadoria"],["pensao","Pensão por morte"],["acidente","Auxílio-acidente"],["maternidade","Salário-maternidade"],["revisao","Revisão de benefício"]];
function acaoPrevDe(a){
  if(ui.acaoSel&&ui.acaoSel[a.id])return ui.acaoSel[a.id];
  if(a.acaoPrev)return a.acaoPrev;
  const t=String(a.assunto||"").toLowerCase();
  if(/bpc|loas/.test(t))return"bpc";if(/acidente/.test(t))return"acidente";if(/matern/.test(t))return"maternidade";
  if(/pens[aã]o/.test(t))return"pensao";if(/revis/.test(t))return"revisao";
  if(/incapac|doen[cç]a|invalid/.test(t))return"incap";if(/aposent/.test(t))return"aposent";
  return"";
}
function docsKit(a){const kit=kitDe(a);if(kit!=="Previdenciário")return KITS[kit];const ac=acaoPrevDe(a);return ac?["prev_contrato_"+ac,...KITS[kit]]:KITS[kit]}
const kitDe=a=>ui.kitSel&&ui.kitSel[a.id]||KIT_DA_AREA[a.area]||"Trabalhista";
const kitFalta=(a,kit)=>{const l=(KIT_EXIGE[kit]||[]).filter(([k])=>!String(valCad(a,k)).trim());if(kit==="Previdenciário"&&!acaoPrevDe(a))l.unshift(["__acao","Ação previdenciária (escolha acima)"]);return l};
function dadosKit(a){
  const sx=String(a.cadastro.sexo||"").trim();const f=/^f/i.test(sx),m=/^m/i.test(sx);
  const fx=(ma,fe,ne)=>f?fe:m?ma:ne;
  const nac=String(a.cadastro.nacionalidade||"").trim();
  const hoje=new Date();
  return{nome:a.nome,cpf_cnpj:a.cadastro.cpf||"",rg:a.cadastro.rg||"",
   nacionalidade:nac&&nac.toLowerCase()!=="brasileiro(a)"?nac:fx("brasileiro","brasileira","brasileiro(a)"),
   data_nascimento:a.cadastro.nascimento||"",portador:fx("portador","portadora","portador(a)"),nascido:fx("nascido","nascida","nascido(a)"),
   domiciliado:fx("domiciliado","domiciliada","domiciliado(a)"),inscrito:fx("inscrito","inscrita","inscrito(a)"),
   estado_civil:a.cadastro.estadoCivil||"",profissao:a.cadastro.profissao||"",endereco:a.cadastro.endereco||"",telefone:a.telefone||"",email:a.cadastro.email||"",
   data_hoje:hoje.toLocaleDateString("pt-BR",{timeZone:TZ}),data_extenso:hoje.toLocaleDateString("pt-BR",{timeZone:TZ,day:"numeric",month:"long",year:"numeric"})};
}
const escXml=v=>String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
async function montarDocx(chave,dados){
  if(typeof JSZip==="undefined")throw new Error("A biblioteca de Word não carregou. Recarregue a página.");
  const t=KITD.tpls[chave];
  const zip=await JSZip.loadAsync(t.zip,{base64:true});
  Object.entries(t.ref).forEach(([nome,h])=>zip.file(nome,KITD.pool[h],{base64:true}));
  for(const nome of Object.keys(zip.files)){
    if(!/^word\/(document|header\d*|footer\d*)\.xml$/.test(nome))continue;
    let x=await zip.file(nome).async("string");
    x=x.replace(/\{([A-Za-z_]+)\}/g,(m,k)=>{if(!(k in dados))return m;const v=String(dados[k]||"").trim();return escXml(v||"__________")});
    zip.file(nome,x);
  }
  return zip.generateAsync({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",compression:"DEFLATE"});
}
const nomeArq=(chave,a)=>(KITD.tpls[chave].nome+" - "+a.nome).replace(/[\\/:*?"<>|]/g,"").trim()+".docx";
async function baixarKit(a,quais,comoZip){
  const kit=kitDe(a);const dl=await (async()=>{try{return await claude.use("downloads")}catch(e){return null}})();
  if(!dl){aviso("Esta tela não consegue salvar arquivos. Abra o sistema pelo link do Claude, no navegador.");return}
  try{
    const dados=dadosKit(a);const arqs=[];
    for(const c of quais){arqs.push({nome:nomeArq(c,a),blob:await montarDocx(c,dados)})}
    if(comoZip){
      const z=new JSZip();arqs.forEach(x=>z.file(x.nome,x.blob));
      await dl.save({filename:("Kit "+kit+" - "+a.nome).replace(/[\\/:*?"<>|]/g,"").trim()+".zip",data:await z.generateAsync({type:"blob"})});
    }else await dl.save({filename:arqs[0].nome,data:arqs[0].blob});
    const agoraK=agoraIso();gravar(a.id,{kitGeradoEm:agoraK,kitVersoes:[...(a.kitVersoes||[]),{em:agoraK,kit,docs:quais.map(c=>KITD.tpls[c].nome)}]},"Kit "+kit+" gerado (versão "+((a.kitVersoes||[]).length+1)+"): "+quais.map(c=>KITD.tpls[c].nome).join(", "));
    toast("Documentos gerados. Confira antes de enviar para assinatura.");render(true);
  }catch(e){
    const c=e&&e.code;
    if(c==="declined")aviso("Você cancelou o download.");
    else if(c==="rate_limited")aviso("Aguarde alguns segundos e tente de novo.");
    else if(c==="host_unavailable")aviso("Este aplicativo não salva arquivos. Abra o sistema no navegador ou no computador.");
    else aviso("Não consegui gerar o documento"+(e&&e.message?": "+e.message:"")+".");
  }
}
function blocoKit(a){
  const kit=kitDe(a);const falta=kitFalta(a,kit);
  const sx=String(a.cadastro.sexo||"").trim();
  const pronto=!falta.length;
  return `<section class="caixa"><strong>Kit para assinatura</strong>
   <label class="campo" style="max-width:20rem"><span class="rotulo">Kit</span><select data-kitsel="1">${Object.keys(KITS).map(k=>`<option ${k===kit?"selected":""}>${k}</option>`).join("")}</select></label>
   ${kit==="Previdenciário"?`<label class="campo" style="max-width:28rem"><span class="rotulo">Ação previdenciária (define o contrato e os honorários)</span><select data-acaosel="1"><option value="">Escolha...</option>${ACOES_PREV.map(([k,n])=>`<option value="${k}" ${k===acaoPrevDe(a)?"selected":""}>${n}</option>`).join("")}</select></label>`:""}
   ${pronto?`<p class="nota" style="margin:.25rem 0">${badge("Cadastro pronto","success")} Os dados necessários para este kit estão preenchidos.${sx?"":" Sem o sexo informado, o texto sai com a forma neutra (portador(a), nascido(a))."}</p>`
    :`<div class="pendencias"><strong>Falta no cadastro para gerar o kit ${esc(kit)}:</strong><ul>${falta.map(([k,r])=>`<li><span>${esc(r)}</span></li>`).join("")}</ul><div class="acoes"><button class="btn sm outline" data-act="abrirAba" data-v="triagem">Completar o cadastro</button></div></div>`}
   <div class="tabwrap" style="margin:.5rem 0"><table><thead><tr><th>Documento</th><th></th></tr></thead><tbody>
   ${docsKit(a).map(c=>`<tr><td>${esc(KITD.tpls[c].nome)}</td><td style="text-align:right"><button class="btn sm outline" data-act="kitDoc" data-k="${c}" ${pronto?"":"disabled"}>Baixar Word</button></td></tr>`).join("")}</tbody></table></div>
   <div class="acoes"><button class="btn" data-act="kitTodos" ${pronto?"":"disabled"}>Baixar o kit completo (.zip)</button>${!pronto?`<button class="btn sm ghost" data-act="kitForcar">Gerar mesmo assim, com linhas em branco</button>`:""}</div>
   <div class="nota" style="margin:.5rem 0">${a.kitGeradoEm?`Kit gerado em ${fmtDHL(a.kitGeradoEm)} (versão ${(a.kitVersoes||[]).length}). `:"Kit ainda não gerado. "}${a.kitEnviadoEm?`Envio ao cliente registrado em ${fmtDHL(a.kitEnviadoEm)}.`:"Envio ao cliente ainda não registrado."}
    <div class="acoes" style="margin-top:.35rem"><button class="btn sm outline" data-act="kitEnviado" ${a.kitGeradoEm?"":"disabled"}>${a.kitEnviadoEm?"Registrar novo envio":"Registrar envio do kit ao cliente"}</button></div></div>
   <p class="nota" style="margin:.5rem 0 0">Os documentos saem no papel timbrado, cada um em um arquivo Word separado. Campos sem dado ficam com linha para preencher à mão. Depois de baixar, envie para assinatura no Tramitação Inteligente.</p></section>`;
}

/* ---------- Pós-venda: contrato assinado até o envio ao Jurídico ---------- */
function infoPos(a){
  const tot=a.docs.length,ok=a.docs.filter(d=>d.situacao==="conferido"||d.situacao==="dispensado").length;
  const ficha=a.situacaoEntrevista==="ficha_revisada"&&a.ficha.revisada;
  const pend=pendencias(a);
  let grupo="prontos";
  if(!a.docs.length||ok<tot)grupo="docs";else if(!ficha)grupo="ficha";
  return{tot,ok,ficha,pend,grupo,fu:followupDe(a)};
}
/* ---------- Tramitação Inteligente (conector do Claude) ---------- */
const TRAM="Tramitação Inteligente";
let tram={est:"parado",lista:[],erro:"",quando:0,abrindo:null};
const soDig=v=>String(v||"").replace(/\D/g,"");
const fmtCpf=v=>{const d=soDig(v);return d.length===11?d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4"):String(v||"")};
function msgErroTram(e){
  switch(e&&e.code){
    case"needs_reauth":return"A conexão com o Tramitação venceu. Reconecte em Configurações > Conectores, no Claude, e tente de novo.";
    case"server_not_connected":return"O conector Tramitação Inteligente não está ligado na sua conta do Claude. Adicione em Configurações > Conectores.";
    case"selection_required":return"Há mais de um conector com este nome na sua conta. Escolha qual usar quando o Claude perguntar.";
    case"not_in_manifest":case"consent_required":return"O acesso ao Tramitação não foi permitido para este sistema. Recarregue a página e permita quando o Claude perguntar.";
    case"approval_required":return"O Claude precisa da sua aprovação para consultar o Tramitação. Clique em Puxar de novo e aprove.";
    case"blocked_by_policy":return"A política da sua organização bloqueia esta consulta ao Tramitação.";
    case"server_unavailable":case"upstream_error":return"O Tramitação não respondeu agora. Tente de novo em instantes.";
    case"tool_error":return"O Tramitação recusou a consulta"+(e.message?": "+String(e.message).slice(0,120):".");
    default:return"Não foi possível falar com o Tramitação ("+((e&&e.code)||"erro")+").";
  }
}
async function mcpTram(){try{return await claude.use("mcp")}catch(e){return null}}
async function puxarTram(){
  if(tram.est==="carregando")return;
  tram.est="carregando";tram.erro="";render(true);
  const mcp=await mcpTram();
  if(!mcp){tram.est="erro";tram.erro="Esta tela não alcança os conectores do Claude. Abra o sistema pelo link do Claude, logada na sua conta.";render(true);return}
  try{
    let cursor=null,todos=[];
    for(let i=0;i<12;i++){
      const r=await mcp.callTool(TRAM,"customers",Object.assign({command:"list",page_size:100},cursor?{cursor}:{}),{cache:false});
      const p=r.payload||{};
      todos=todos.concat(Array.isArray(p.items)?p.items:[]);
      if(!p.nextCursor)break;cursor=p.nextCursor;
    }
    tram.lista=todos.filter(c=>c.customer_type==="cliente"&&c.id!==1&&c.name).sort((x,y)=>x.name.localeCompare(y.name,"pt-BR"));
    tram.total=todos.length;tram.quando=Date.now();tram.est="ok";
  }catch(e){tram.est="erro";tram.erro=msgErroTram(e)}
  render(true);
}
const atendDoCliente=c=>itens.find(a=>String(a.tramitaId||"")===String(c.id)||(soDig(c.cpf_cnpj)&&soDig(a.cadastro&&a.cadastro.cpf)===soDig(c.cpf_cnpj)));
function enderecoTram(c){
  const rua=[c.street,c.street_number].filter(Boolean).join(", ");
  const cid=[c.city,c.state].filter(Boolean).join("/");
  return [rua,c.neighborhood,cid,c.zipcode?"CEP "+c.zipcode:""].filter(Boolean).join(" - ");
}
function abrirDoTram(c){
  const ja=atendDoCliente(c);
  if(ja){go("/atendimento/"+ja.id);return}
  tram.abrindo=c;
  modal(`<h2>Abrir atendimento</h2><div class="formN"><p style="margin:0"><strong>${esc(c.name)}</strong><br><span class="nota">${esc(fmtCpf(c.cpf_cnpj))}</span></p>
   <label class="campo"><span class="rotulo">Área</span><select id="t_area">${opts(AREAS,"previdenciario" in AREAS?"previdenciario":"trabalhista")}</select></label>
   <label class="campo"><span class="rotulo">Assunto (opcional)</span><input type="text" id="t_ass" placeholder="Ex.: revisão de benefício"></label>
   <p class="nota" style="margin:0">O sistema busca no Tramitação o telefone, o endereço e os dados pessoais do cadastro e preenche o atendimento. Nada é alterado no Tramitação.</p></div>
   <div class="rod"><button class="btn outline" data-act="fechar">Cancelar</button><button class="btn" id="t_ok" data-act="criarDoTram">Criar e abrir</button></div>`);
}
async function criarDoTram(){
  const c=tram.abrindo;if(!c)return;
  const bt=$("#t_ok");if(bt){bt.disabled=true;bt.textContent="Buscando cadastro..."}
  let f=c;
  const mcp=await mcpTram();
  if(mcp){
    try{
      const r=await mcp.callTool(TRAM,"customers",{command:"get",ids:[c.id]},{cache:false});
      const p=r.payload;
      const o=p&&Array.isArray(p.items)?p.items[0]:p&&Array.isArray(p.customers)?p.customers[0]:Array.isArray(p)?p[0]:p;
      if(o&&typeof o==="object"&&o.id)f=Object.assign({},c,o);
    }catch(e){aviso("Criei o atendimento só com nome e CPF. "+msgErroTram(e))}
  }
  const cad={};
  const put=(k,v)=>{if(v!==undefined&&v!==null&&String(v).trim()!=="")cad[k]=String(v).trim()};
  put("cpf",fmtCpf(f.cpf_cnpj));put("rg",f.rg_numero);put("sexo",f.sexo);
  put("nascimento",f.birthdate?dataBr(String(f.birthdate).slice(0,10)):"");
  put("estadoCivil",f.marital_status);put("profissao",f.profession);put("mae",f.mother_name);
  put("email",f.email);put("endereco",enderecoTram(f));
  const tel=f.phone_mobile||f.phone_1||f.phone_2||"";
  const id=await criar({nome:c.name,telefone:String(tel||""),origem:"Cliente já cadastrado",area:$("#t_area").value,assunto:$("#t_ass").value.trim(),cadastro:cad,tramitaId:String(c.id),
    logInicial:"Atendimento aberto a partir do cadastro no Tramitação Inteligente (id "+c.id+")"});
  tram.abrindo=null;fechar();if(id)go("/atendimento/"+id);
}
function listaTram(t){
  if(tram.est==="parado")return `<div class="painel"><p>Traga para cá os clientes cadastrados no Tramitação Inteligente. O sistema só lê a lista; nada é alterado lá. Na primeira vez o Claude vai pedir a sua permissão.</p><div class="acoes"><button class="btn" data-act="puxarTram">${ico("busca",14)} Puxar clientes do Tramitação</button></div></div>`;
  if(tram.est==="carregando")return `<div class="painel"><p class="nota">Buscando no Tramitação...</p></div>`;
  if(tram.est==="erro")return `<div class="bloqueio"><p>${esc(tram.erro)}</p><div class="acoes"><button class="btn sm" data-act="puxarTram">Tentar de novo</button></div></div>`;
  const l=tram.lista.filter(c=>!t||[c.name,c.cpf_cnpj,c.email].some(v=>String(v||"").toLowerCase().includes(t)||(soDig(t)&&soDig(v).includes(soDig(t)))));
  const hora=new Date(tram.quando).toLocaleTimeString("pt-BR",{timeZone:TZ,hour:"2-digit",minute:"2-digit"});
  return `<p class="nota">${tram.lista.length} clientes cadastrados no Tramitação. Atualizado às ${hora}. <button class="btn sm ghost" data-act="puxarTram">Atualizar</button></p>
  <div class="tabwrap"><table><thead><tr><th>Nome</th><th>CPF</th><th>E-mail</th><th></th></tr></thead><tbody>
  ${l.length?l.map(c=>{const ja=atendDoCliente(c);return `<tr><td><strong>${esc(c.name)}</strong></td><td>${esc(fmtCpf(c.cpf_cnpj))}</td><td>${esc(c.email||"")}</td><td style="text-align:right"><button class="btn sm ${ja?"outline":""}" data-act="abrirTram" data-id="${esc(String(c.id))}">${ja?"Ver atendimento":"Abrir atendimento"}</button></td></tr>`}).join(""):`<tr><td colspan="4" class="vazio">Ninguém encontrado.</td></tr>`}</tbody></table></div>`;
}

/* ---------- prazos e audiências (atividades do Tramitação) ---------- */
let prazos={est:"parado",lista:[],erro:"",quando:0,atras:0};
const TIPOS_PRAZO={Deadline:"Prazo",Hearing:"Audiência",Expertise:"Perícia"};
const addDias=(iso,n)=>{const d=new Date(iso+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
async function puxarPrazos(){
  if(prazos.est==="carregando")return;
  prazos.est="carregando";prazos.erro="";render(true);
  const mcp=await mcpTram();
  if(!mcp){prazos.est="erro";prazos.erro="Esta tela não alcança os conectores do Claude. Abra o sistema pelo link do Claude, logada na sua conta.";render(true);return}
  try{
    const hoje=hojeIso();
    const buscar=async(ini,fim)=>{let cur=null,tot=[];
      for(let i=0;i<10;i++){
        const r=await mcp.callTool(TRAM,"activities",Object.assign({command:"list",start_date:ini,end_date:fim,page_size:100},cur?{cursor:cur}:{}),{cache:false});
        const p=r.payload||{};tot=tot.concat(Array.isArray(p.items)?p.items:[]);
        if(!p.nextCursor)break;cur=p.nextCursor}
      return tot};
    const util=a=>!a.completed&&TIPOS_PRAZO[a.type]&&!/\(exemplo\)/i.test(a.title||"")&&(a.assignments||[]).some(x=>/Jackeline/i.test(x.name));
    const fut=(await buscar(hoje,addDias(hoje,60))).filter(util);
    let at=[];try{at=(await buscar(addDias(hoje,-120),addDias(hoje,-1))).filter(util)}catch(e){}
    const vis=new Set();
    prazos.lista=[...at,...fut].filter(a=>vis.has(a.id)?false:(vis.add(a.id),true)).sort((x,y)=>String(x.start).localeCompare(String(y.start)));
    prazos.quando=Date.now();prazos.est="ok";gravaFlag();
  }catch(e){prazos.est="erro";prazos.erro=msgErroTram(e)}
  render(true);
}
function blocoPrazos(){
  const hoje=hojeIso();
  let h=`<h3 class="sec">Prazos, audiências e perícias (Tramitação)</h3>`;
  if(prazos.est==="parado")return h+`<div class="painel"><p class="nota">Traz do Tramitação os prazos e audiências em aberto, dos próximos 60 dias e os atrasados. O sistema não calcula prazo: confira sempre a contagem no processo.</p><div class="acoes"><button class="btn" data-act="puxarPrazos">Puxar prazos do Tramitação</button></div></div>`;
  if(prazos.est==="carregando")return h+`<p class="nota">Buscando no Tramitação...</p>`;
  if(prazos.est==="erro")return h+`<div class="bloqueio"><p>${esc(prazos.erro)}</p><div class="acoes"><button class="btn sm" data-act="puxarPrazos">Tentar de novo</button></div></div>`;
  const hora=new Date(prazos.quando).toLocaleTimeString("pt-BR",{timeZone:TZ,hour:"2-digit",minute:"2-digit"});
  return h+`<p class="nota">${prazos.lista.length} em aberto. Atualizado às ${hora}. Confira sempre a contagem no processo; feriados e suspensões não são recalculados aqui. <button class="btn sm ghost" data-act="puxarPrazos">Atualizar</button></p>
  <div class="tabwrap"><table><thead><tr><th>Quando</th><th>Tipo</th><th>O que</th><th>Prazo final</th><th></th></tr></thead><tbody>
  ${prazos.lista.length?prazos.lista.map(a=>{const d=String(a.start).slice(0,10);const hr=a.all_day?"":" "+String(a.start).slice(11,16);const atr=d<hoje;
   return `<tr><td class="${atr?"atrasada":""}">${dataBr(d)}${hr}${atr?" (atrasado)":""}</td><td>${badge(TIPOS_PRAZO[a.type],a.type==="Hearing"?"warning":"outline")}</td><td><strong>${esc(a.title)}</strong>${a.customer?`<div class="nota">${esc(a.customer.name)}</div>`:""}</td><td>${a.deadline_on?dataBr(a.deadline_on):""}</td><td>${/^https:\/\//.test(a.url||"")?`<a href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">Abrir</a>`:""}</td></tr>`}).join(""):`<tr><td colspan="5" class="vazio">Nada em aberto.</td></tr>`}</tbody></table></div>`;
}
/* ---------- Hoje: prazos do dia (Tramitação) ---------- */
let tentouPrazos=false;
const lerFlag=()=>{try{return localStorage.getItem("tramOk")==="1"}catch(e){return false}};
const gravaFlag=()=>{try{localStorage.setItem("tramOk","1")}catch(e){}};
function prazosDoDia(kind){
  const hoje=hojeIso(),lim=addDias(hoje,kind==="aud"?60:7);
  const dia=a=>String(a.start).slice(0,10);
  const doTipo=a=>kind==="aud"?a.type!=="Deadline":a.type==="Deadline";
  const abertos=prazos.lista.filter(a=>doTipo(a)&&!baixas[a.id]);
  return{devidos:abertos.filter(a=>dia(a)<=hoje),prox:abertos.filter(a=>dia(a)>hoje&&dia(a)<=lim),conf:prazos.lista.filter(a=>doTipo(a)&&baixas[a.id]&&dia(a)<=hoje)};
}
function linhaPrazoHoje(a,baixado){
  const hoje=hojeIso();const d=String(a.start).slice(0,10);const hr=a.all_day?"":" "+String(a.start).slice(11,16);const atr=d<hoje;
  const quando=d===hoje?"Hoje"+hr:dataBr(d)+hr+(atr?" (atrasado)":"");
  const link=/^https:\/\//.test(a.url||"")?`<a class="btn sm ghost" href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">Abrir no Tramitação</a>`:"";
  return `<div class="tarefa"><div><strong>${esc(a.title)}</strong><div class="nota">${a.customer?esc(a.customer.name)+" · ":""}${badge(TIPOS_PRAZO[a.type],a.type==="Hearing"?"warning":"outline")} <span class="${atr&&!baixado?"atrasada":""}">${quando}</span>${a.deadline_on?" · prazo final "+dataBr(a.deadline_on):""}</div></div>
   <div class="acoes">${link}<button class="btn sm ${baixado?"ghost":"outline"}" data-act="${baixado?"desfazerBaixa":"baixarPrazo"}" data-id="${esc(String(a.id))}">${baixado?"Desfazer":"Marcar como conferido"}</button></div></div>`;
}
function blocoHoje(kind){
  const aud=kind==="aud";const tit=aud?"Audiências e perícias (Tramitação)":"Prazos do dia (Tramitação)";
  if(prazos.est==="parado")return `<div class="cardL"><h2>${tit}</h2><p class="nota">Traz do Tramitação os seus prazos, audiências e perícias de hoje, os atrasados e os próximos dias.</p><div class="acoes"><button class="btn" data-act="puxarPrazos">Trazer do Tramitação</button></div></div>`;
  if(prazos.est==="carregando")return `<div class="cardL"><h2>${tit}</h2><p class="nota">Buscando no Tramitação...</p></div>`;
  if(prazos.est==="erro")return `<div class="cardL"><h2>${tit}</h2><div class="bloqueio"><p>${esc(prazos.erro)}</p><div class="acoes"><button class="btn sm" data-act="puxarPrazos">Tentar de novo</button></div></div></div>`;
  const {devidos,prox,conf}=prazosDoDia(kind);
  const hora=new Date(prazos.quando).toLocaleTimeString("pt-BR",{timeZone:TZ,hour:"2-digit",minute:"2-digit"});
  return `<div class="cardL"><h2>${aud?"Audiências e perícias":"Prazos do dia"} (${devidos.length})</h2>
   <p class="nota">Atualizado às ${hora}. "Conferido" é só uma marca deste sistema: não dá baixa no Tramitação. O sistema não calcula prazo, confira a contagem no processo. <button class="btn sm ghost" data-act="puxarPrazos">Atualizar</button></p>
   <h3 class="sec">${aud?"Hoje e atrasadas":"Hoje e atrasados"}</h3>
   ${devidos.length?devidos.map(a=>linhaPrazoHoje(a,false)).join(""):`<p class="nota">${aud?"Nenhuma audiência ou perícia hoje nem atrasada.":"Nenhum prazo para hoje nem atrasado."}</p>`}
   ${prox.length?`<h3 class="sec">${aud?"Próximos 60 dias":"Próximos 7 dias"} (${prox.length})</h3>${prox.map(a=>linhaPrazoHoje(a,false)).join("")}`:""}
   ${conf.length?`<h3 class="sec">Conferidos (${conf.length})</h3>${conf.map(a=>linhaPrazoHoje(a,true)).join("")}`:""}</div>`;
}
function iniciaPrazosHoje(){
  if(tentouPrazos||rota.nome!=="hoje"||!lerFlag())return;
  tentouPrazos=true;if(prazos.est==="parado")puxarPrazos();if(pubs.est==="parado")puxarPubs();
}
/* ---------- publicações do Tramitação (somente leitura) ---------- */
let pubs={est:"parado",lista:[],total:0,erro:"",quando:0};
const KIND_PUB={prazo:"Prazo",audiencia:"Audiência",tarefa:"Tarefa"};
async function puxarPubs(){
  if(pubs.est==="carregando")return;
  pubs.est="carregando";pubs.erro="";render(true);
  const mcp=await mcpTram();
  if(!mcp){pubs.est="erro";pubs.erro="Esta tela não alcança os conectores do Claude. Abra o sistema pelo link do Claude, logada na sua conta.";render(true);return}
  try{
    const r=await mcp.callTool(TRAM,"publications",{command:"list",status:"nao_lida",limit:30},{cache:false});
    const p=r.payload||{};
    pubs.lista=Array.isArray(p.items)?p.items:[];
    pubs.total=typeof p.total_count==="number"?p.total_count:pubs.lista.length;
    pubs.quando=Date.now();pubs.est="ok";gravaFlag();
  }catch(e){pubs.est="erro";pubs.erro=msgErroTram(e)}
  render(true);
}
function linhaPub(p){
  const sug=(p.suggestions||[]).filter(x=>x.status!=="descartada");
  const link=/^https:\/\//.test(p.url||"")?`<a class="btn sm outline" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Abrir no Tramitação</a>`:"";
  return `<div class="tarefa"><div><strong>${esc(p.numero_processo||"Sem processo vinculado")}</strong>
   <div class="nota">${esc([p.tribunal,p.orgao].filter(Boolean).join(" · "))}</div>
   <div class="nota">Disponibilizada em ${p.disponibilizacao_date?dataBr(p.disponibilizacao_date):"?"}${p.inicio_do_prazo_date?" · início do prazo "+dataBr(p.inicio_do_prazo_date):""}</div>
   ${sug.length?`<ul class="sugs">${sug.map(x=>`<li>${badge(KIND_PUB[x.kind]||x.kind||"Atividade","outline")} ${esc(x.title)}${x.suggested_date?" · "+dataBr(x.suggested_date):""}${x.status==="criada"?" (já criada)":""}</li>`).join("")}</ul>`:(p.summary_ready?"":`<div class="nota">Resumo ainda não gerado no Tramitação.</div>`)}</div>
   <div class="acoes">${link}</div></div>`;
}
function blocoPubs(){
  const tit="Publicações não lidas (Tramitação)";
  if(pubs.est==="parado")return `<div class="cardL"><h2>${tit}</h2><p class="nota">Traz do Tramitação as publicações e intimações ainda não lidas, com as sugestões de prazo que o próprio Tramitação já calculou.</p><div class="acoes"><button class="btn" data-act="puxarPubs">Trazer publicações</button></div></div>`;
  if(pubs.est==="carregando")return `<div class="cardL"><h2>${tit}</h2><p class="nota">Buscando no Tramitação...</p></div>`;
  if(pubs.est==="erro")return `<div class="cardL"><h2>${tit}</h2><div class="bloqueio"><p>${esc(pubs.erro)}</p><div class="acoes"><button class="btn sm" data-act="puxarPubs">Tentar de novo</button></div></div></div>`;
  const hora=new Date(pubs.quando).toLocaleTimeString("pt-BR",{timeZone:TZ,hour:"2-digit",minute:"2-digit"});
  const resto=pubs.total-pubs.lista.length;
  return `<div class="cardL"><h2>Publicações não lidas (${pubs.total})</h2>
   <p class="nota">Atualizado às ${hora}. Somente leitura: para tratar a publicação ou criar o prazo, abra no Tramitação. Confira sempre a contagem do prazo no processo. <button class="btn sm ghost" data-act="puxarPubs">Atualizar</button></p>
   ${pubs.lista.length?pubs.lista.map(linhaPub).join(""):`<p class="nota">Nenhuma publicação não lida. Tudo triado.</p>`}
   ${resto>0?`<p class="nota">Mais ${resto} não lida${resto>1?"s":""} no Tramitação.</p>`:""}</div>`;
}
/* ---------- Fechamento, assinatura (Tramitação) e pós-contrato ---------- */
const ROT_ENV={rascunho:"Rascunho (ainda não enviado)",aguardando_assinaturas:"Aguardando assinaturas",finalizado:"Finalizado (todos assinaram)",cancelado:"Cancelado",expirado:"Expirado"};
const PESSOAS=["Hudson","Dra. Jackeline"];
const mesExt=m=>{if(!m)return"";const [y,mm]=m.split("-");return new Date(+y,+mm-1,1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"})};
function efeitosAssinatura(a,patch){
  if(a.docs.length===0)patch.docs=docsDoTipo(a);
  if(a.situacaoDocumentos==="nao_iniciada")patch.situacaoDocumentos="solicitados";
  if(!(a.tarefas||[]).some(t=>t.id==="ficha_envio"))patch.tarefas=[...(a.tarefas||[]),{id:"ficha_envio",titulo:"Enviar ficha de atendimento",data:hojeIso(),situacao:"pendente"}];
  if(!a.posStatus)patch.posStatus="link_a_enviar";
}
function blocoEncerrado(a){
  if(a.situacaoContratacao!=="nao_fechou")return"";
  return `<div class="bloqueio"><strong>Encerrado sem contratação</strong><p>Motivo: ${esc(a.motivoEncerramento||"não informado")}</p><div class="acoes"><button class="btn sm" data-act="reabrir">Reabrir atendimento</button></div><p class="nota">O histórico é preservado ao reabrir.</p></div>`;
}
async function buscarEnv(a){
  const mcp=await mcpTram();ui.envList=ui.envList||{};
  if(!mcp){ui.envList[a.id]={erro:"Esta tela não alcança os conectores do Claude. Abra o sistema pelo link do Claude."};render(true);return}
  ui.envList[a.id]={carregando:true};render(true);
  try{
    const input=a.tramitaId?{command:"list",customer_id:Number(a.tramitaId),limit:20}:{command:"list",search:String(a.nome||"").trim().split(/\s+/)[0],limit:20};
    const r=await mcp.callTool(TRAM,"signatures",input,{cache:false});
    ui.envList[a.id]={itens:(r.payload&&r.payload.items)||[],porCliente:!!a.tramitaId};
  }catch(e){ui.envList[a.id]={erro:msgErroTram(e)}}
  render(true);
}
async function consultarAss(a){
  if(!a.tramEnvelopeId)return;
  const mcp=await mcpTram();
  if(!mcp){gravar(a.id,{tramErro:"Esta tela não alcança os conectores do Claude. Abra o sistema pelo link do Claude. Mantido o último status confirmado."});render(true);return}
  ui.sync=a.id;render(true);
  try{
    const r=await mcp.callTool(TRAM,"signatures",{command:"get",id:Number(a.tramEnvelopeId)},{cache:false});
    const p=r.payload||{};const st=String(p.status||"");
    const patch={tramConfirmado:st,tramSyncEm:agoraIso(),tramErro:"",tramUrl:/^https:\/\//.test(p.url||"")?p.url:""};
    let log=null;
    if(st==="finalizado"&&a.situacaoContratacao!=="assinada"){
      patch.situacaoContratacao="assinada";efeitosAssinatura(a,patch);
      log="Assinatura confirmada pelo Tramitação (envelope "+a.tramEnvelopeId+")"+(a.assinadoEm?"":". Data efetiva da assinatura pendente")+(a.fechamentoPor?"":". Sem atribuição de quem fechou");
    }else if(st&&st!==a.tramConfirmado)log="Tramitação: envelope "+(ROT_ENV[st]||st);
    await gravar(a.id,patch,log);
  }catch(e){await gravar(a.id,{tramErro:msgErroTram(e)+" Mantido o último status confirmado."})}
  ui.sync=null;render(true);
}
function blocoAssinatura(a){
  const ass=a.situacaoContratacao==="assinada";
  const L=ui.envList&&ui.envList[a.id];
  const lista=!L?"":L.carregando?`<p class="nota">Buscando envelopes no Tramitação...</p>`:L.erro?`<p class="nota atrasada">${esc(L.erro)}</p>`
   :`<div class="tabwrap"><table><thead><tr><th>Envelope</th><th>Situação</th><th>Criado em</th><th></th></tr></thead><tbody>${L.itens.length?L.itens.map(e=>`<tr><td><strong>${esc(e.name)}</strong><div class="nota">#${esc(String(e.id))}</div></td><td>${esc(ROT_ENV[e.status]||e.status)}</td><td>${dataBr(e.created_at)}</td><td style="text-align:right"><button class="btn sm outline" data-act="vincularEnv" data-id="${esc(String(e.id))}">Vincular</button></td></tr>`).join(""):`<tr><td colspan="4" class="vazio">Nenhum envelope encontrado${L.porCliente?" para este cliente":" com este nome"}.</td></tr>`}</tbody></table></div>`;
  return `<div class="caixa"><strong>Assinatura e fechamento</strong>
   <p class="nota" style="margin:.25rem 0">O Tramitação Inteligente confirma se o contrato foi assinado. Vincule o envelope e consulte quando quiser.</p>
   <div class="etapaCampos">${sit("Situação do contrato","situacaoContratacao",R_CONTR,a.situacaoContratacao)}
    <label class="campo"><span class="rotulo">Número do envelope no Tramitação</span><input type="text" data-blur="tramEnvelopeId" value="${esc(a.tramEnvelopeId)}" placeholder="Ex.: 131" inputmode="numeric"></label></div>
   <div class="acoes"><button class="btn sm outline" data-act="buscarEnv">Buscar envelopes${a.tramitaId?" do cliente":" pelo nome"}</button><button class="btn sm" data-act="consultarAss" ${a.tramEnvelopeId&&ui.sync!==a.id?"":"disabled"}>${ui.sync===a.id?"Consultando...":"Consultar assinatura"}</button>${a.tramUrl?`<a class="btn sm ghost" href="${esc(a.tramUrl)}" target="_blank" rel="noopener noreferrer">Abrir envelope</a>`:""}</div>
   ${lista}
   <p class="nota" style="margin:.5rem 0">${a.tramConfirmado?"Último status confirmado: <strong>"+esc(ROT_ENV[a.tramConfirmado]||a.tramConfirmado)+"</strong>. ":"Nenhum status confirmado ainda. "}${a.tramSyncEm?"Última consulta: "+fmtDHL(a.tramSyncEm)+".":"Ainda não consultado."}</p>
   ${a.tramErro?`<div class="bloqueio"><p>${esc(a.tramErro)}</p><div class="acoes"><button class="btn sm" data-act="consultarAss">Tentar de novo</button></div></div>`:""}
   <div class="etapaCampos"><label class="campo"><span class="rotulo">Data efetiva da assinatura</span><input type="date" data-blur="assinadoEm" value="${esc(a.assinadoEm)}"></label>
    <label class="campo"><span class="rotulo">Quem fechou o contrato</span><input type="text" list="pessoasFech" data-blur="fechamentoPor" value="${esc(a.fechamentoPor)}" placeholder="Nome de quem fechou"><datalist id="pessoasFech">${PESSOAS.map(p=>`<option value="${esc(p)}">`).join("")}</datalist></label></div>
   ${ass&&!a.assinadoEm?`<p class="nota atrasada">Pendência: a integração com o Tramitação não informa a data da assinatura. Informe a data efetiva (consta no documento assinado). Sem ela, o contrato não entra no mês do relatório de fechamentos.</p>`:""}
   ${ass&&!a.fechamentoPor?`<p class="nota atrasada">Sem atribuição: este contrato aparece como "sem atribuição" no relatório de fechamentos até alguém informar quem fechou.</p>`:""}
   <p class="nota">Responsável comercial (campo "Responsável", acima) e quem fechou são campos separados. Correções ficam no histórico.</p></div>`;
}
/* ---------- Pós-contrato / Documentação ---------- */
const POS_ST=[["link_a_enviar","A enviar ficha"],["aguardando","Aguardando preenchimento"],["recebida","Ficha recebida"],["em_revisao","Em conferência"],["pronta","Pronta para encaminhar"],["encaminhada","Encaminhada ao Jurídico"]];
const posSt=a=>a.situacaoMinuta!=="nao_iniciada"?"encaminhada":(a.posStatus||"link_a_enviar");
const rotPos=k=>(POS_ST.find(x=>x[0]===k)||[,k])[1];
const R_PEND_TIPO={cliente:"Aguardando cliente",interna:"Providência interna"};
const ACAO2TIPO={bpc:"BPC/LOAS",incap:"Benefício por incapacidade",acidente:"Auxílio-acidente",aposent:"Aposentadoria",pensao:"Pensão por morte",maternidade:"Salário-maternidade",revisao:"Revisão de benefício"};
const tipoDemandaDe=a=>a.prepTipo||(a.area==="previdenciario"?(ACAO2TIPO[acaoPrevDe(a)]||""):"");
const areaDoTipo=t=>TIPOS_DEM.trabalhista.includes(t)?"trabalhista":TIPOS_DEM.previdenciario.includes(t)?"previdenciario":"civel";
const docOk=d=>d.situacao==="conferido"||d.situacao==="dispensado";
const cap=s=>String(s||"").charAt(0).toUpperCase()+String(s||"").slice(1).toLowerCase();
const primeiroNome=a=>cap(String(a.nome||"").trim().split(/\s+/)[0]);
function pedirData(msg,def){const v=prompt(msg,def||"");if(v===null)return null;const t=v.trim();return/^\d{4}-\d{2}-\d{2}$/.test(t)?t:""}

/* checklists de documentos por tipo de demanda (sugeridos; a direção confirma na aba Checklists) */
let cfgDocs={};
const DOCS_ESP={
 "BPC/LOAS":{sem:/Laudos|composição familiar/i,mais:[["CadÚnico atualizado (comprovante de inscrição)",1],["Documentos de todos os integrantes do grupo familiar",1],["Comprovantes de renda do grupo familiar",1],["Laudos, exames e receitas médicas (se pessoa com deficiência)",1]]},
 "Benefício por incapacidade":{sem:/Laudos|composição familiar/i,mais:[["Laudos, exames, atestados e receitas médicas recentes",1],["Documentos de benefício por incapacidade anterior, se houver",0]]},
 "Auxílio-acidente":{sem:/Laudos|composição familiar/i,mais:[["CAT, se foi emitida",0],["Laudos, exames e prontuário relacionados à sequela",1],["Documentos do benefício por incapacidade anterior (inclusive data de cessação)",1]]},
 "Salário-maternidade":{sem:/Laudos|composição familiar/i,mais:[["Certidão de nascimento da criança (ou documento de adoção ou guarda)",1],["Comprovantes da atividade ou das contribuições da segurada",1]]},
 "Pensão por morte":{sem:/Laudos|composição familiar/i,mais:[["Certidão de óbito",1],["Documentos que comprovem a relação de dependência com o falecido",1]]},
 "Revisão de benefício":{sem:/Laudos|composição familiar/i,mais:[["Carta de concessão e memória de cálculo do benefício",1]]},
 "Rescisão indireta":{sem:null,mais:[["Provas da falta grave do empregador (mensagens, documentos)",1]]},
 "Reconhecimento de vínculo":{sem:null,mais:[["Comprovantes de pagamento (PIX, depósito, recibo)",1]]},
 "Acidente de trabalho / doença ocupacional":{sem:null,mais:[["CAT, se foi emitida",0],["Atestados, laudos e prontuário médico",1]]},
 "Assédio moral":{sem:null,mais:[["Mensagens, e-mails ou outros registros da conduta",1]]}
};
function docsPadrao(area,tipo){
  const base=(CHECKLIST[area]||[]).map(t=>[t,!/\bse\b|possíveis testemunhas/i.test(t)]);
  const e=DOCS_ESP[tipo];
  const l=e?base.filter(([t])=>!e.sem||!e.sem.test(t)).concat(e.mais):base;
  return{itens:l.map(([t,o])=>({t,o:!!o})),sugerido:true};
}
const docsCfgDe=a=>{const t=tipoDemandaDe(a);return t&&cfgDocs[t]&&cfgDocs[t].itens?cfgDocs[t]:docsPadrao(a.area,t)};
const docsDoTipo=a=>docsCfgDe(a).itens.map(i=>({id:uid(),nome:i.t,situacao:"solicitado",obr:i.o}));
async function salvarCfgDocs(tipo,obj){
  cfgDocs[tipo]=obj;render(true);
  if(db){try{await db.collection("config").doc("checklistsDocs").set({tipos:cfgDocs})}catch(e){aviso("Não consegui salvar o checklist ("+(e&&e.code||"erro")+").")}}
}
function painelChecklistsDocs(){
  const tipo=ui.dkTipo||todosTipos()[0];const area=areaDoTipo(tipo);
  const salvo=!!(cfgDocs[tipo]&&cfgDocs[tipo].itens);const c=salvo?cfgDocs[tipo]:docsPadrao(area,tipo);
  return `<p class="nota">Documentos que o Pós-contrato pede e confere em cada tipo de demanda. A mudança vale para os próximos casos; para um caso em andamento use "Acrescentar itens do tipo" na aba Documentos.</p>
  <label class="campo" style="max-width:26rem"><span class="rotulo">Tipo de demanda</span><select data-dktipo="1">${todosTipos().map(t=>`<option ${t===tipo?"selected":""}>${esc(t)}</option>`).join("")}</select></label>
  ${cfgDocs[tipo]&&cfgDocs[tipo].confirmado?`<p class="nota">${badge("Definido pela direção","success")}</p>`:`<p class="nota">Itens sugeridos a partir dos modelos do escritório. Confirme ou ajuste.</p>`}
  ${c.itens.map((i,n)=>`<div class="item"><span class="itemNome">${esc(i.t)}</span><label class="nota"><input type="checkbox" data-dkobr="${n}" ${i.o?"checked":""}> Obrigatório</label><button class="btn ghost sm ico" aria-label="Remover item" data-act="dkRem" data-n="${n}">${ico("lixo",14)}</button></div>`).join("")}
  <div class="linhaLink"><input type="text" id="dkNovo" placeholder="Novo documento"><label class="nota"><input type="checkbox" id="dkNovoObr" checked> Obrigatório</label><button class="btn outline" data-act="dkAdd">${ico("mais",14)} Incluir</button></div>
  <div class="acoes" style="margin-top:.75rem"><button class="btn" data-act="dkConfirmar">Marcar como definido pela direção</button></div>`;
}

/* pendências do pós-contrato */
const pendPos=a=>a.posPend||[];
const pendPosAb=a=>pendPos(a).filter(p=>p.situacao!=="resolvida");
const pendPosPrincipal=a=>pendPosAb(a).slice().sort((x,y)=>String(x.retorno||"9999").localeCompare(String(y.retorno||"9999")))[0]||null;
const complAberto=a=>pendPosAb(a).some(p=>p.tipo==="cliente");
function retornoPos(a){const p=pendPosPrincipal(a);if(p&&p.retorno)return p.retorno;if(posSt(a)==="aguardando"&&a.posRetornoFicha)return a.posRetornoFicha;return""}
const retAtrasado=a=>{const r=retornoPos(a);return!!r&&r<hojeIso()&&posSt(a)!=="encaminhada"};
const RES_CAMPOS=[["relato","Relato do cliente"],["fatos","Datas e fatos informados"],["docs","Documentos disponíveis"],["pontos","Pontos que precisam de análise técnica"],["lacunas","Lacunas de informação"]];
function bloqueiosEnc(a){
  const b=[];
  const recebida=!!a.fichaRecebidaEm||a.situacaoEntrevista==="ficha_revisada";
  const revisada=!!a.posRevEm||(a.situacaoEntrevista==="ficha_revisada"&&a.ficha.revisada);
  if(!recebida)b.push("Registrar a ficha de atendimento recebida");
  else if(!revisada)b.push("Revisar a ficha recebida");
  if(!a.docs.length)b.push("Montar o checklist de documentos");
  a.docs.filter(d=>d.obr!==false&&!docOk(d)).forEach(d=>b.push("Documento obrigatório sem conferência ou dispensa: "+d.nome));
  pendPosAb(a).filter(p=>p.essencial).forEach(p=>b.push("Pendência essencial em aberto: "+p.texto));
  const r=a.posResumo||{};
  RES_CAMPOS.forEach(([k,l])=>{if(String(r[k]||"").trim().length<3)b.push("Resumo do atendimento: preencher \""+l+"\"")});
  if(!String(a.posRecebe||"").trim())b.push("Identificar quem recebe o caso no Jurídico");
  return b;
}
function proxPos(a){
  const s=posSt(a);const p=pendPosPrincipal(a);
  if(s==="encaminhada")return{pend:"",acao:"Aguardando análise do Jurídico",quem:a.prepResponsavel||""};
  if(p)return{pend:p.texto,acao:p.proxima,quem:p.tipo==="cliente"?"Cliente":(p.resp||"")};
  if(s==="link_a_enviar")return{pend:"Ficha ainda não enviada",acao:"Enviar a ficha ao cliente",quem:a.posResponsavel||""};
  if(s==="aguardando")return{pend:"Cliente ainda não preencheu a ficha",acao:"Cobrar o cliente se passar da data combinada",quem:"Cliente"};
  if(s==="recebida")return{pend:"Ficha recebida, ainda não revisada",acao:"Revisar a ficha",quem:a.posResponsavel||""};
  const b=bloqueiosEnc(a);
  return{pend:b[0]||"",acao:b.length?b[0]:"Encaminhar ao Jurídico",quem:a.posResponsavel||""};
}
function msgAcolhimento(a){
  const l=String(a.fichaLinkManual||"").trim();
  return "Olá, "+primeiroNome(a)+"! Aqui é a equipe da JS Advocacia. Seu contrato foi confirmado e agora vamos organizar o seu caso. "
   +(l?"Para começar, precisamos que você responda a uma ficha de atendimento neste link: "+l+"\n\nLeva poucos minutos e pode ser feita pelo celular. ":"Para começar, vamos fazer algumas perguntas sobre o seu caso e separar os documentos necessários. Podemos conversar por aqui? ")
   +"Se tiver qualquer dúvida, é só responder esta mensagem.";
}
const msgComplemento=(a,p)=>"Olá, "+primeiroNome(a)+"! Para seguir com o seu caso, precisamos de um complemento: "+p.texto+". Pode nos enviar por aqui"+(p.retorno?", se possível até "+dataBr(p.retorno):"")+"? Se tiver dificuldade, é só avisar. Obrigada!";
function copiar(txt,el){
  const ok=()=>toast("Mensagem copiada. Revise e envie pelo WhatsApp.");
  const fb=()=>{try{if(el){el.focus();el.select();document.execCommand("copy");ok()}else aviso("Selecione e copie o texto manualmente.")}catch(e){aviso("Não consegui copiar. Selecione o texto e copie manualmente.")}};
  try{navigator.clipboard.writeText(txt).then(ok,fb)}catch(e){fb()}
}
function snapFicha(a,motivo){
  const v=a.fichaVersoes||[];const r=JSON.parse(JSON.stringify(a.ficha.respostas||{}));const u=v[v.length-1];
  if(u&&JSON.stringify(u.respostas)===JSON.stringify(r))return v;
  return[...v,{n:v.length+1,em:agoraIso(),respostas:r,motivo:motivo||""}];
}
function linhaPend(a,p){
  const msg=ui.pmsg===p.id;const atras=p.situacao!=="resolvida"&&p.retorno&&p.retorno<hojeIso();
  return `<div class="item" style="flex-wrap:wrap;align-items:flex-start"><div class="itemNome"><strong>${esc(p.texto)}</strong> ${badge(R_PEND_TIPO[p.tipo]||p.tipo,p.tipo==="cliente"?"warning":"secondary")}${p.essencial?" "+badge("Essencial","error"):""}${p.situacao==="resolvida"?" "+badge("Resolvida","success"):""}
   <div class="nota">Quem resolve: ${esc(p.resp||"—")} · Próxima ação: ${esc(p.proxima||"—")} · Retorno: <span class="${atras?"atrasada":""}">${p.retorno?dataBr(p.retorno)+(atras?" (atrasado)":""):"sem data"}</span>${p.enviadoEm?" · Pedido enviado em "+dataBr(p.enviadoEm):""}${p.resolvidaEm?" · Resolvida em "+dataBr(p.resolvidaEm):""}</div>
   ${msg?`<textarea id="pm_${p.id}" rows="3" style="margin-top:.4rem">${esc(msgComplemento(a,p))}</textarea><div class="acoes" style="margin-top:.4rem"><button class="btn sm" data-act="posPendCopiar" data-id="${p.id}">Copiar mensagem</button><button class="btn sm outline" data-act="posPendEnv" data-id="${p.id}">Registrar envio do pedido</button></div>`:""}</div>
   ${p.situacao!=="resolvida"?`<div class="acoes">${p.tipo==="cliente"?`<button class="btn sm outline" data-act="posPendMsg" data-id="${p.id}">${msg?"Fechar mensagem":"Mensagem ao cliente"}</button>`:""}<button class="btn sm outline" data-act="posPendRet" data-id="${p.id}">Alterar retorno</button><button class="btn sm" data-act="posPendRes" data-id="${p.id}">Resolver</button></div>`:""}</div>`;
}
function blocoPosContrato(a){
  if(a.situacaoContratacao!=="assinada")return`<p class="nota">O pós-contrato começa quando a assinatura for confirmada. Nesse momento o sistema coloca a demanda na fila "A enviar ficha de atendimento".</p>`;
  const st=posSt(a);const idx=POS_ST.findIndex(x=>x[0]===st);
  const tipo=tipoDemandaDe(a);const bl=bloqueiosEnc(a);
  const vers=a.fichaVersoes||[];
  const abertas=pendPosAb(a),fech=pendPos(a).filter(p=>p.situacao==="resolvida");
  const nDocs=a.docs.length,nOk=a.docs.filter(docOk).length,nObr=a.docs.filter(d=>d.obr!==false);
  const r=a.posResumo||{};
  let h=`<section class="pendencias"><p style="margin:0"><strong>Pós-contrato / Documentação</strong></p><div class="chips" style="margin:.4rem 0 0">${POS_ST.map(([k,l],i)=>`<span class="chip ${i===idx?"on":""}" style="${i<idx?"opacity:.6":""}">${l}</span>`).join("")}</div>${complAberto(a)?`<p style="margin:.5rem 0 0">${badge("Aguardando complemento","warning")}</p>`:""}</section>`;
  h+=`<div class="caixa"><strong>Responsável e demanda</strong><div class="etapaCampos">
    <label class="campo"><span class="rotulo">Responsável pelo pós-contrato</span><input type="text" list="pessoasFech" data-blur="posResponsavel" value="${esc(a.posResponsavel)}" placeholder="Atribuir responsável"></label>
    <label class="campo"><span class="rotulo">Tipo de demanda</span><select data-prepsel="prepTipo"><option value="">Selecione</option>${(TIPOS_DEM[a.area]||[]).map(t=>`<option ${t===tipo?"selected":""}>${esc(t)}</option>`).join("")}</select></label>
    <label class="campo"><span class="rotulo">Etapa (ajuste manual)</span><select data-posst="1">${POS_ST.filter(x=>x[0]!=="encaminhada").map(([k,l])=>`<option value="${k}" ${k===st?"selected":""}>${l}</option>`).join("")}${st==="encaminhada"?`<option selected>Encaminhada ao Jurídico</option>`:""}</select></label></div>
    ${!a.posResponsavel?`<p class="nota atrasada">Sem responsável. A primeira ação é atribuir um responsável.</p>`:""}
    ${!tipo?`<p class="nota atrasada">Selecione o tipo de demanda para aplicar o checklist de documentos correto.</p>`:""}
    <p class="nota">Contrato assinado em ${a.assinadoEm?dataBr(a.assinadoEm):"data a informar"}. Serviço: ${esc(a.assunto||tipo||AREAS[a.area]||"")}.</p></div>`;
  h+=`<div class="caixa"><strong>Acolhimento e ficha de atendimento</strong>
    <p class="nota" style="margin:0">Ficha: <strong>${esc(AREAS[a.area]||"")}</strong> (a ficha segue a área do atendimento). ${a.fichaEnviadaEm?"Enviada em "+dataBr(a.fichaEnviadaEm)+". ":"Ainda não enviada. "}${a.fichaRecebidaEm?"Recebida em "+dataBr(a.fichaRecebidaEm)+". ":""}${a.posRevEm?"Revisada por "+esc(a.posRevisor)+" em "+dataBr(a.posRevEm)+".":""}</p>
    <label class="campo"><span class="rotulo">Link da ficha (opcional, cole aqui se usar outra ferramenta)</span><input type="text" id="fichaLink" data-blur="fichaLinkManual" value="${esc(a.fichaLinkManual)}" placeholder="https://..."></label>
    <label class="campo"><span class="rotulo">Mensagem de acolhimento para WhatsApp (revise antes de enviar)</span><textarea id="posMsg" rows="5">${esc(msgAcolhimento(a))}</textarea></label>
    <div class="acoes"><button class="btn sm outline" data-act="copiarMsg">Copiar mensagem</button><button class="btn sm outline" data-act="posEnvio">Registrar envio da ficha</button><button class="btn sm outline" data-act="posRecebida">Registrar ficha recebida</button><button class="btn sm outline" data-act="posFichaRev">Marcar ficha como revisada</button><button class="btn sm outline" data-act="posCompl">Solicitar complemento da ficha</button><button class="btn sm ghost" data-act="abrirAba" data-v="entrevista">Ver e editar as respostas</button></div>
    <label class="campo"><span class="rotulo">Dados obtidos em entrevista com o cliente</span><textarea id="posEntrevista" rows="3" data-blur="posEntrevista" placeholder="Informações que o cliente passou por telefone ou presencialmente">${esc(a.posEntrevista)}</textarea></label>
    ${vers.length?`<details><summary class="nota">Versões das respostas preservadas (${vers.length})</summary>${vers.map((v,i)=>`<p class="nota" style="margin:.4rem 0 0"><strong>Versão ${v.n||i+1}</strong> · ${fmtDHL(v.em)}${v.motivo?" · "+esc(v.motivo):""}</p><dl class="resp">${(FICHA.f[a.area]||[]).filter(p=>String((v.respostas||{})[p.id]||"").trim()).map(p=>`<dt>${esc(p.texto)}</dt><dd>${esc(v.respostas[p.id])}</dd>`).join("")||"<dd>Sem respostas.</dd>"}</dl>`).join("")}</details>`:""}
    <p class="nota">Link individual para o cliente preencher no celular (com revogação e reemissão): ainda não disponível. Exige uma página pública fora do Claude. Por enquanto, a equipe aplica a ficha por conversa ou usa o link de outra ferramenta, no campo acima.</p></div>`;
  h+=`<div class="caixa"><strong>Documentos</strong><p class="nota" style="margin:0">${nDocs?nOk+" de "+nDocs+" itens conferidos ou dispensados; "+nObr.filter(docOk).length+" de "+nObr.length+" obrigatórios resolvidos. ":"Sem checklist de documentos. "}${a.docs.some(d=>d.duvida)?"Há dúvida técnica registrada para avaliação do Jurídico.":""}</p><div class="acoes"><button class="btn sm outline" data-act="abrirAba" data-v="documentos">Conferir documentos</button></div></div>`;
  h+=`<div class="caixa"><strong>Pendências</strong>
    ${abertas.length?abertas.map(p=>linhaPend(a,p)).join(""):`<p class="nota">Nenhuma pendência em aberto.</p>`}
    <details><summary class="nota">Nova pendência</summary><div class="linha3" style="margin-top:.5rem">
     <label class="campo"><span class="rotulo">O que falta</span><input type="text" id="pp_texto"></label>
     <label class="campo"><span class="rotulo">Tipo</span><select id="pp_tipo">${opts(R_PEND_TIPO,"cliente")}</select></label>
     <label class="campo"><span class="rotulo">Quem resolve</span><input type="text" id="pp_resp" list="pessoasFech" placeholder="Cliente ou nome da equipe"></label>
     <label class="campo"><span class="rotulo">Próxima ação</span><input type="text" id="pp_prox"></label>
     <label class="campo"><span class="rotulo">Data de retorno</span><input type="date" id="pp_ret"></label>
     <label class="campo"><span class="rotulo">Impede o encaminhamento?</span><label class="nota"><input type="checkbox" id="pp_ess" checked> Sim, é essencial</label></label></div>
     <div class="acoes" style="margin-top:.5rem"><button class="btn sm" data-act="posPendAdd">Registrar pendência</button></div></details>
    ${fech.length?`<details><summary class="nota">Resolvidas (${fech.length})</summary>${fech.map(p=>linhaPend(a,p)).join("")}</details>`:""}</div>`;
  h+=`<div class="caixa"><strong>Resumo do atendimento</strong><p class="nota" style="margin:0">Fica no dossiê que o Jurídico recebe. Preencha todos os campos.</p>
    ${RES_CAMPOS.map(([k,l])=>`<label class="campo"><span class="rotulo">${l}${k==="lacunas"?" (escreva \"nenhuma\" se não houver)":""}</span><textarea id="rs_${k}" rows="3" data-resumo="${k}">${esc(r[k])}</textarea></label>`).join("")}
    <div class="acoes"><button class="btn sm ghost" data-act="resumoDocs">Preencher documentos disponíveis com o checklist</button></div></div>`;
  h+=`<div class="caixa"><strong>Encaminhamento ao Jurídico</strong>
    <label class="campo"><span class="rotulo">Quem recebe o caso no Jurídico</span><input type="text" list="pessoasFech" data-blur="posRecebe" value="${esc(a.posRecebe)}" placeholder="Nome"></label>
    ${st==="encaminhada"?`<p class="nota">${badge("Encaminhada","success")} Recebe: ${esc(a.posRecebe)}. Primeira providência: ${esc(a.posProvidencia)}.</p>`:bl.length?`<div class="bloqueio"><strong>Impedem o encaminhamento:</strong><ul>${bl.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`:`<p class="nota">${badge("Dossiê completo","success")} Todos os requisitos para encaminhar foram atendidos.</p>`}
    <div class="acoes">${st!=="encaminhada"?`<button class="btn outline" data-act="posPronta" ${bl.length?"disabled":""}>Marcar pronta para encaminhar</button><button class="btn" data-act="posEncaminhar" ${bl.length?"disabled":""}>Encaminhar ao Jurídico</button>`:""}</div>
    ${(a.posEncaminhamentos||[]).length?`<h3 class="sec">Encaminhamentos</h3><ul class="nota">${a.posEncaminhamentos.map(x=>`<li>${x.tipo==="reenvio"?"Reenvio":"Envio"} ${x.n} em ${fmtDHL(x.em)}: enviou ${esc(x.de)}, recebe ${esc(x.para)}. Primeira providência: ${esc(x.providencia)}.</li>`).join("")}</ul>`:""}
    ${(a.posDevolucoes||[]).length?`<h3 class="sec">Devoluções do Jurídico</h3><ul class="nota">${a.posDevolucoes.map(x=>`<li>${fmtDHL(x.em)}: ${esc(x.motivo)}. Responsável: ${esc(x.resp)}. Retorno: ${dataBr(x.retorno)}.</li>`).join("")}</ul>`:""}</div>`;
  return h;
}
/* linha de documento no checklist (aba Documentos) */
function linhaDoc(a,d){
  const ab=(ui.docAb||{})[d.id]||d.situacao!=="solicitado";
  const fl=[d.obr===false?badge("Opcional","secondary"):"",d.duvida?badge("Dúvida técnica","warning"):"",d.situacao==="conferido"?badge("Conferido por "+(d.conferidoPor||"—"),"success"):"",d.situacao==="dispensado"?badge("Dispensado","secondary"):""].filter(Boolean).join(" ");
  const det=ab?`<div class="docdet"><div class="linha3">
    <label class="campo"><span class="rotulo">Arquivo (nome ou link)</span><input type="text" id="df_${d.id}_arquivo" data-docf="arquivo" data-d="${d.id}" value="${esc(d.arquivo)}"></label>
    <label class="campo"><span class="rotulo">Recebido em</span><input type="date" id="df_${d.id}_recebidoEm" data-docf="recebidoEm" data-d="${d.id}" value="${esc(d.recebidoEm)}"></label>
    <label class="campo"><span class="rotulo">Conferência</span><span class="nota">${d.situacao==="conferido"?"Por "+esc(d.conferidoPor)+" em "+dataBr(d.conferidoEm):"Ainda não conferido"}</span></label></div>
    ${d.situacao==="precisa_correcao"?`<p class="nota atrasada">Ilegível ou incompleto: ${esc(d.motivo)}</p>`:""}
    ${d.situacao==="dispensado"&&d.dispensa?`<p class="nota">Dispensa: ${esc(d.dispensa.just)}. Autorizada por ${esc(d.dispensa.por)} em ${dataBr(d.dispensa.em)}.</p>`:""}
    <label class="campo"><span class="rotulo">Dúvida sobre a suficiência como prova (para avaliação técnica)</span><textarea id="df_${d.id}_duvida" rows="2" data-docf="duvida" data-d="${d.id}">${esc(d.duvida)}</textarea></label>
    <label class="nota"><input type="checkbox" data-docobr="${d.id}" ${d.obr===false?"":"checked"}> Documento obrigatório</label></div>`:"";
  return `<div class="docl"><div class="item"><span class="itemNome">${esc(d.nome)} ${fl}</span><select class="selPeq" data-docsel="${d.id}">${opts(R_DOCITEM,d.situacao)}</select><button class="btn ghost sm" data-act="docAb" data-d="${d.id}">${ab&&(ui.docAb||{})[d.id]?"Recolher":"Detalhes"}</button><button class="btn ghost sm ico" aria-label="Remover item" data-act="docRem" data-d="${d.id}">${ico("lixo",14)}</button></div>${det}</div>`;
}
function mudarDoc(a,id,novo){
  const d=a.docs.find(x=>x.id===id);if(!d||d.situacao===novo)return false;
  const hoje=hojeIso();const pat={situacao:novo};let log="Documento \""+d.nome+"\": "+rot(R_DOCITEM,novo);
  let pends=pendPos(a);
  if(d.situacao==="conferido"&&novo!=="conferido"){pat.conferidoPor="";pat.conferidoEm=""}
  if(novo==="recebido"&&!d.recebidoEm)pat.recebidoEm=hoje;
  if(novo==="conferido"){
    let arq=d.arquivo;if(!arq){arq=(prompt("Registre o arquivo conferido (nome ou link):")||"").trim();if(!arq)return false}
    const q=(prompt("Quem conferiu? A conferência abrange identificação, organização, legibilidade e completude.",a.posResponsavel||a.responsavel||"")||"").trim();if(!q)return false;
    Object.assign(pat,{arquivo:arq,conferidoPor:q,conferidoEm:hoje,recebidoEm:d.recebidoEm||hoje,motivo:""});log+=" por "+q;
  }
  if(novo==="precisa_correcao"){
    const m=(prompt("O que está ilegível ou incompleto?")||"").trim();if(m.length<3)return false;
    pat.motivo=m;log+=": "+m;
    const ret=pedirData("Data de retorno combinada com o cliente (AAAA-MM-DD):",addDias(hoje,3))||addDias(hoje,3);
    if(!pends.some(p=>p.docId===id&&p.situacao!=="resolvida"))pends=[...pends,{id:uid(),texto:"Reenviar "+d.nome+" ("+m+")",tipo:"cliente",resp:"Cliente",proxima:"Pedir novo envio do documento",retorno:ret,essencial:d.obr!==false,situacao:"aberta",criadaEm:agoraIso(),docId:id,origem:"documento"}];
  }
  if(novo==="dispensado"){
    const j=(prompt("Justificativa da dispensa (obrigatória):")||"").trim();if(j.length<5){aviso("Informe a justificativa da dispensa.");return false}
    const q=(prompt("Quem autorizou a dispensa?","Dra. Jackeline")||"").trim();if(!q){aviso("Informe quem autorizou a dispensa.");return false}
    pat.dispensa={just:j,por:q,em:agoraIso()};log+=". Justificativa: "+j+". Autorizada por "+q;
  }
  if(novo!=="precisa_correcao"&&novo!=="solicitado")pends=pends.map(p=>p.docId===id&&p.situacao!=="resolvida"?{...p,situacao:"resolvida",resolvidaEm:hoje,resolvidaPor:"automático: documento "+rot(R_DOCITEM,novo).toLowerCase()}:p);
  const docs=a.docs.map(x=>x.id===id?{...x,...pat}:x);
  gravar(a.id,{docs,situacaoDocumentos:sitDocs(a,docs),posPend:pends},log);
  return true;
}
/* painel da equipe */
function pgPosVenda(){
  const pf=ui.pf||{};
  const todos=itens.filter(a=>!a.arquivado&&a.situacaoContratacao==="assinada");
  const aguard=itens.filter(a=>!a.arquivado&&a.triagem==="viavel"&&a.situacaoContratacao==="aguardando_assinatura");
  const fila=todos.filter(a=>posSt(a)==="link_a_enviar");
  const flt=a=>(!pf.resp||(pf.resp==="__sem"?!a.posResponsavel:a.posResponsavel===pf.resp))&&(!pf.area||a.area===pf.area)&&(!pf.tipo||tipoDemandaDe(a)===pf.tipo);
  const base=todos.filter(flt);
  const et=pf.et||"";
  const lista=base.filter(a=>et===""?posSt(a)!=="encaminhada":et==="__compl"?complAberto(a):et==="__atr"?retAtrasado(a):posSt(a)===et)
    .sort((x,y)=>{const sc=a=>retAtrasado(a)?0:retornoPos(a)?1:2;return sc(x)-sc(y)||String(retornoPos(x)||"9").localeCompare(String(retornoPos(y)||"9"))});
  const nomes=[...new Set([...PESSOAS,...todos.map(a=>a.posResponsavel).filter(Boolean)])];
  const tipos=[...new Set(todos.map(tipoDemandaDe).filter(Boolean))];
  const n=f=>base.filter(f).length;
  const chips=[["","Em andamento",n(a=>posSt(a)!=="encaminhada")],...POS_ST.map(([k,l])=>[k,l,n(a=>posSt(a)===k)]),["__compl","Aguardando complemento",n(complAberto)],["__atr","Retorno atrasado",n(retAtrasado)]];
  const linha=a=>{const s=posSt(a),p=proxPos(a),r=retornoPos(a),at=retAtrasado(a);
    return `<tr class="linha" data-go="/atendimento/${a.id}?aba=contrato"><td><strong>${esc(a.nome)}</strong>${complAberto(a)?`<div>${badge("Aguardando complemento","warning")}</div>`:""}</td><td>${esc(a.assunto||AREAS[a.area]||"")}<div class="nota">${AREAS[a.area]||""}${tipoDemandaDe(a)?" · "+esc(tipoDemandaDe(a)):""}</div></td><td>${a.posResponsavel?esc(a.posResponsavel):badge("Atribuir responsável","warning")}</td><td>${esc(rotPos(s))}</td><td>${esc(p.pend||"—")}</td><td>${esc(p.acao||"—")}${p.quem?`<div class="nota">${esc(p.quem)}</div>`:""}</td><td class="${at?"atrasada":""}">${r?dataBr(r)+(at?" (atrasado)":""):"—"}</td></tr>`};
  return cabecalho("Pós-contrato","Da assinatura ao encaminhamento ao Jurídico: ficha, documentos, pendências e resumo.")
   +`<div class="cardL"><h2>A enviar ficha de atendimento (${fila.length})</h2>${fila.length?fila.map(a=>`<div class="tarefa" style="flex-wrap:wrap"><div><strong>${esc(a.nome)}</strong><div class="nota">${esc(a.assunto||tipoDemandaDe(a)||AREAS[a.area]||"")} · Assinatura: ${a.assinadoEm?dataBr(a.assinadoEm):"data a informar"}</div></div>
     <label class="campo" style="min-width:12rem"><span class="rotulo">Quem assume</span><input type="text" list="pessoasFech" data-posresp="${a.id}" value="${esc(a.posResponsavel)}" placeholder="Atribuir responsável"></label>
     <button class="btn sm outline" data-go="/atendimento/${a.id}?aba=contrato">Abrir dossiê</button></div>`).join(""):`<p class="nota">Nenhuma ficha a enviar.</p>`}<datalist id="pessoasFech">${PESSOAS.map(p=>`<option value="${esc(p)}">`).join("")}</datalist></div>`
   +(aguard.length?`<div class="cardL"><h2>Contratos aguardando assinatura (${aguard.length})</h2>${aguard.map(a=>`<div class="tarefa"><div><strong>${esc(a.nome)}</strong><div class="nota">${AREAS[a.area]||""}${a.telefone?" · "+esc(a.telefone):""}</div></div><button class="btn sm outline" data-go="/atendimento/${a.id}?aba=contrato">Abrir contrato</button></div>`).join("")}</div>`:"")
   +`<div class="filtros"><label class="campo"><span class="rotulo">Responsável</span><select data-pf="resp"><option value="">Todos</option>${nomes.map(x=>`<option ${pf.resp===x?"selected":""}>${esc(x)}</option>`).join("")}<option value="__sem" ${pf.resp==="__sem"?"selected":""}>Sem responsável</option></select></label>
    <label class="campo"><span class="rotulo">Área</span><select data-pf="area"><option value="">Todas</option>${Object.keys(AREAS).map(k=>`<option value="${k}" ${pf.area===k?"selected":""}>${esc(AREAS[k])}</option>`).join("")}</select></label>
    <label class="campo"><span class="rotulo">Tipo de demanda</span><select data-pf="tipo"><option value="">Todos</option>${tipos.map(x=>`<option ${pf.tipo===x?"selected":""}>${esc(x)}</option>`).join("")}</select></label></div>
   <div class="chips">${chips.map(([k,l,c])=>`<button type="button" class="chip ${et===k?"on":""}" data-act="posFiltro" data-v="${k}">${l} <strong>${c}</strong></button>`).join("")}</div>
   <div class="tabwrap"><table><thead><tr><th>Cliente</th><th>Demanda</th><th>Responsável</th><th>Etapa</th><th>Pendência principal</th><th>Próxima ação</th><th>Retorno</th></tr></thead><tbody>
   ${lista.length?lista.map(linha).join(""):`<tr><td colspan="7" class="vazio">Nada neste filtro.</td></tr>`}</tbody></table></div>
   <p class="nota" style="margin-top:1rem">Os retornos atrasados aparecem primeiro. A etapa "Encaminhada ao Jurídico" sai da lista em andamento; use o filtro para vê-las.</p>`;
}
function pgFechamentos(){
  const mes=ui.fechMes||hojeIso().slice(0,7);const pes=ui.fechPessoa||"";
  const ass=itens.filter(a=>!a.arquivado&&a.situacaoContratacao==="assinada");
  const semData=ass.filter(a=>!a.assinadoEm);
  const doMes=ass.filter(a=>a.assinadoEm&&String(a.assinadoEm).slice(0,7)===mes);
  const nomes=[...new Set([...PESSOAS,...ass.map(a=>a.fechamentoPor).filter(Boolean)])];
  const lista=doMes.filter(a=>!pes||(pes==="__sem"?!a.fechamentoPor:a.fechamentoPor===pes)).sort((x,y)=>String(x.assinadoEm).localeCompare(String(y.assinadoEm)));
  const tot={};doMes.forEach(a=>{const k=a.fechamentoPor||"Sem atribuição";tot[k]=(tot[k]||0)+1});
  const linha=a=>`<tr class="linha" data-go="/atendimento/${a.id}?aba=contrato"><td><strong>${esc(a.nome)}</strong><div class="nota">${esc(a.assunto)}</div></td><td>${AREAS[a.area]||""}</td><td>${a.assinadoEm?dataBr(a.assinadoEm):"pendente"}</td><td>${a.fechamentoPor?esc(a.fechamentoPor):badge("Sem atribuição","warning")}</td><td>${esc(a.responsavel||"")}</td></tr>`;
  return cabecalho("Fechamentos","Contratos assinados por mês e por quem fechou, para a apuração da bonificação.")+`
  <div class="filtros"><label class="campo"><span class="rotulo">Mês da assinatura</span><input type="month" data-fech="mes" value="${esc(mes)}"></label>
   <label class="campo"><span class="rotulo">Quem fechou</span><select data-fech="pessoa"><option value="">Todos</option>${nomes.map(n=>`<option ${pes===n?"selected":""}>${esc(n)}</option>`).join("")}<option value="__sem" ${pes==="__sem"?"selected":""}>Sem atribuição</option></select></label></div>
  <h3 class="sec">Total em ${esc(mesExt(mes))}: ${doMes.length} contrato${doMes.length===1?"":"s"}</h3>
  <div class="tabwrap"><table><thead><tr><th>Pessoa</th><th>Contratos</th></tr></thead><tbody>${Object.keys(tot).length?Object.entries(tot).sort((x,y)=>y[1]-x[1]).map(([k,n])=>`<tr><td>${k==="Sem atribuição"?badge(k,"warning"):esc(k)}</td><td>${n}</td></tr>`).join(""):`<tr><td colspan="2" class="vazio">Nenhum contrato assinado neste mês.</td></tr>`}</tbody></table></div>
  <h3 class="sec">Detalhamento${pes?" (filtrado)":""}</h3>
  <div class="tabwrap"><table><thead><tr><th>Cliente</th><th>Área</th><th>Assinatura</th><th>Quem fechou</th><th>Resp. comercial</th></tr></thead><tbody>${lista.length?lista.map(linha).join(""):`<tr><td colspan="5" class="vazio">Nada neste filtro.</td></tr>`}</tbody></table></div>
  ${semData.length?`<h3 class="sec">Assinados sem data efetiva (${semData.length})</h3><p class="nota">Não entram em nenhum mês até a data ser informada.</p><div class="tabwrap"><table><thead><tr><th>Cliente</th><th>Área</th><th>Assinatura</th><th>Quem fechou</th><th>Resp. comercial</th></tr></thead><tbody>${semData.map(linha).join("")}</tbody></table></div>`:""}
  <p class="nota">O cálculo financeiro da bonificação fica pendente até a direção informar a regra aplicável.</p>`;
}
/* ---------- Preparação do caso (continua o pós-contrato a partir de "Pronta para o jurídico") ---------- */
const PREP_ET=[["analise","Aguardando análise"],["preparacao","Em preparação"],["revisao","Aguardando revisão"],["pronto","Pronto para protocolo"],["protocolado","Protocolado"]];
const ET2MIN={analise:"minuta_gerada",preparacao:"em_revisao",revisao:"em_revisao",pronto:"aprovada",protocolado:"protocolada"};
const MIN2ET={minuta_gerada:"analise",em_revisao:"preparacao",aprovada:"pronto",protocolada:"protocolado"};
const etapaPrep=a=>a.situacaoMinuta==="nao_iniciada"?"":(a.prepEtapa||MIN2ET[a.situacaoMinuta]||"analise");
const rotEt=k=>(PREP_ET.find(x=>x[0]===k)||[,k])[1];
const VIAS={trab_judicial:"Trabalhista judicial",prev_adm:"Previdenciária administrativa",prev_judicial:"Previdenciária judicial"};
const TIPOS_DEM={trabalhista:["Rescisão indireta","Reconhecimento de vínculo","Acidente de trabalho / doença ocupacional","Assédio moral","Outra demanda trabalhista"],
 previdenciario:["BPC/LOAS","Benefício por incapacidade","Auxílio-acidente","Aposentadoria","Pensão por morte","Salário-maternidade","Revisão de benefício","Outra demanda previdenciária"],
 civel:["Demanda cível"]};
const VIA_DA_AREA={trabalhista:"trab_judicial",previdenciario:"prev_judicial"};
const CK_BASE=[["Cadastro do cliente completo e conferido",1],["Procuração e declarações assinadas",1],["Documentos obrigatórios da área conferidos",1],["Peça ou requerimento elaborado",1]];
const CK_ESP={
 "Rescisão indireta":[["Apontar a(s) falta(s) específica(s) do art. 483 da CLT",1],["Provas da falta grave (mensagens, documentos, testemunhas)",1],["Extrato do FGTS conferido (recolhimentos)",1],["Cálculo estimado das verbas e valor da causa",1]],
 "Reconhecimento de vínculo":[["Provas de pessoalidade, onerosidade, não eventualidade e subordinação",1],["Comprovantes de pagamento (PIX, depósito, recibo)",1],["Testemunhas identificadas",0],["Avisar a advogada se a prova for só testemunhal",1],["Cálculo estimado e valor da causa",1]],
 "Acidente de trabalho / doença ocupacional":[["CAT, laudos e prontuário médico",1],["Nexo causal ou concausal analisado",1],["Estimativa de pensão só com ressalva de perícia médica",0]],
 "Assédio moral":[["Provas da conduta reiterada (mensagens, e-mails, testemunhas)",1],["Atestados relacionados, sem citar diagnóstico além dos documentos",0]],
 "BPC/LOAS":[["Requerimento administrativo e resposta do INSS anexados",1],["CadÚnico atualizado e coerente com a narrativa",1],["Renda do grupo familiar comprovada",1],["Laudos, exames e receitas (se pessoa com deficiência)",1],["Orientar o cliente sobre as perícias (social e, se deficiência, médica)",0],["Valor da causa calculado",1]],
 "Benefício por incapacidade":[["CNIS atualizado (qualidade de segurado e carência)",1],["Laudos, exames e atestados atuais",1],["Requerimento e resposta do INSS anexados",1]]
};
const checklistPadrao=tipo=>{const esp=CK_ESP[tipo];return{itens:[...(esp||[]),...CK_BASE].map(([t,o])=>({t,o:!!o})),aDefinir:!esp,confirmado:false}};
let cfgCk={};
const checklistDe=tipo=>cfgCk[tipo]&&cfgCk[tipo].itens?cfgCk[tipo]:checklistPadrao(tipo);
const todosTipos=()=>[...TIPOS_DEM.trabalhista,...TIPOS_DEM.previdenciario,...TIPOS_DEM.civel];
const PESSOA_PREP=()=>PESSOAS;
function ckFalta(a){return(a.prepChecklist||[]).filter(i=>i.o&&!i.feito&&!i.dispensa)}
function pendAbertas(a){return(a.prepPendencias||[]).filter(p=>p.situacao!=="resolvida")}
function pendPrincipal(a){const l=pendAbertas(a).sort((x,y)=>String(x.data||"9999").localeCompare(String(y.data||"9999")));return l[0]||null}
function proximaAcaoPrep(a){
  const e=etapaPrep(a);const p=pendPrincipal(a);
  if(e==="protocolado")return{quem:"",acao:"Acompanhar o processo"};
  if(p)return{quem:p.tipo==="cliente"?"Cliente":(p.quem||a.prepResponsavel||""),acao:p.proxima||p.texto};
  if(e==="analise")return{quem:a.prepResponsavel||"",acao:a.prepProvidencia||"Fazer a análise inicial"};
  if(e==="preparacao"){const f=ckFalta(a);return{quem:a.prepResponsavel||"",acao:f.length?"Item obrigatório: "+f[0].t:"Enviar a peça para revisão"}}
  if(e==="revisao"){const v=(a.prepVersoes||[]).length;return{quem:"Revisor",acao:"Revisar a versão "+v}}
  return{quem:a.prepResponsavel||"",acao:"Protocolar e registrar o protocolo"};
}
const prazoVencido=a=>etapaPrep(a)&&etapaPrep(a)!=="protocolado"&&a.prepPrazoInterno&&a.prepPrazoInterno<hojeIso();
async function setPrep(a,etapa,extra,log){
  const patch=Object.assign({prepEtapa:etapa,situacaoMinuta:ET2MIN[etapa]},extra||{});
  await gravar(a.id,patch,log||("Preparação do caso: "+rotEt(etapa)));
}
function encaminharAoJuridico(a,resp,prov){
  const jaTem=a.situacaoMinuta!=="nao_iniciada";
  const patch={prepResponsavel:resp||a.prepResponsavel||"",prepProvidencia:prov||a.prepProvidencia||""};
  if(!jaTem){patch.prepEtapa="analise";patch.situacaoMinuta="minuta_gerada";
    if(!a.prepVia&&VIA_DA_AREA[a.area])patch.prepVia=VIA_DA_AREA[a.area]}
  return gravar(a.id,patch,jaTem?"Encaminhamento repetido ao jurídico: caso atualizado. Responsável: "+(patch.prepResponsavel||"—")+". Primeira providência: "+(patch.prepProvidencia||"—"):"Encaminhado ao jurídico: aguardando análise. Responsável: "+(patch.prepResponsavel||"—")+". Primeira providência: "+(patch.prepProvidencia||"—"));
}
function resumoEntrada(a){
  const perg=(FICHA.f[a.area]||[]);const resp=a.ficha.respostas||{};
  const preench=perg.filter(p=>String(resp[p.id]||"").trim());
  const docs=a.docs||[];
  return `<details class="caixa"><summary><strong>Resumo do atendimento, ficha e documentos</strong></summary>
   <p class="nota"><strong>${esc(a.nome)}</strong> · ${esc(AREAS[a.area]||"")}${a.assunto?" · "+esc(a.assunto):""}${a.telefone?" · "+esc(a.telefone):""}</p>
   ${a.triagemNotas?`<p class="nota">Triagem: ${esc(a.triagemNotas)}</p>`:""}
   <h3 class="sec">Respostas da ficha (${preench.length})</h3>
   ${preench.length?`<dl class="resp">${preench.map(p=>`<dt>${esc(p.texto)}</dt><dd>${esc(resp[p.id])}</dd>`).join("")}</dl>`:`<p class="nota">Nenhuma resposta registrada.</p>`}
   ${(a.fichaVersoes||[]).length?`<p class="nota">A primeira versão das respostas (${fmtDHL(a.fichaVersoes[0].em)}) está preservada.</p>`:""}
   <h3 class="sec">Documentos (${docs.filter(d=>d.situacao==="conferido"||d.situacao==="dispensado").length} de ${docs.length} conferidos ou dispensados)</h3>
   <ul class="nota">${docs.map(d=>`<li>${esc(d.nome)}: ${esc(rot(R_DOCITEM,d.situacao))}</li>`).join("")||"<li>Sem checklist de documentos.</li>"}</ul></details>`;
}
function blocoPrep(a){
  const e=etapaPrep(a);const idx=PREP_ET.findIndex(x=>x[0]===e);
  const tipos=TIPOS_DEM[a.area]||[];
  let h=`<section class="pendencias"><p style="margin:0"><strong>Preparação do caso</strong></p>
   <div class="chips" style="margin:.4rem 0 0">${PREP_ET.map(([k,r],i)=>`<span class="chip ${i===idx?"on":""}" style="${i<idx?"opacity:.6":""}">${r}</span>`).join("")}</div></section>`;
  h+=resumoEntrada(a);
  h+=`<div class="caixa"><strong>Responsável e prazos</strong><div class="etapaCampos">
    <label class="campo"><span class="rotulo">Responsável pela preparação</span><input type="text" list="pessoasFech" data-blur="prepResponsavel" value="${esc(a.prepResponsavel)}"></label>
    <label class="campo"><span class="rotulo">Primeira providência</span><input type="text" data-blur="prepProvidencia" value="${esc(a.prepProvidencia)}"></label>
    <label class="campo"><span class="rotulo">Prazo interno</span><input type="date" data-blur="prepPrazoInterno" value="${esc(a.prepPrazoInterno)}"></label>
    <label class="campo"><span class="rotulo">Prazo oficial (informado pela equipe)</span><input type="date" data-blur="prepPrazoOficial" value="${esc(a.prepPrazoOficial)}"></label>
    <label class="campo"><span class="rotulo">Descrição do prazo oficial</span><input type="text" data-blur="prepPrazoOficialDesc" value="${esc(a.prepPrazoOficialDesc)}" placeholder="Ex.: prazo da decisão do INSS"></label></div>
    <p class="nota">O prazo interno é da equipe. O prazo oficial é só o que a equipe informa aqui: o sistema não calcula prazo, confira no processo.</p></div>`;
  // análise
  h+=`<div class="caixa"><strong>Análise inicial</strong><div class="etapaCampos">
    <label class="campo"><span class="rotulo">Tipo de demanda</span><select data-prepsel="prepTipo"><option value="">Escolha...</option>${tipos.map(t=>`<option ${a.prepTipo===t?"selected":""}>${esc(t)}</option>`).join("")}</select></label>
    <label class="campo"><span class="rotulo">Via de atuação</span><select data-prepsel="prepVia"><option value="">Escolha...</option>${Object.entries(VIAS).map(([k,v])=>`<option value="${k}" ${a.prepVia===k?"selected":""}>${v}</option>`).join("")}</select></label></div>
    ${e==="analise"?`<div class="acoes"><button class="btn" data-act="prepIniciar">Concluir análise e iniciar a preparação</button></div>`:""}</div>`;
  // checklist
  if(e!=="analise"){
    const ck=a.prepChecklist||[];const falta=ckFalta(a);
    const tdef=checklistDe(a.prepTipo||"").aDefinir&&a.prepTipo;
    h+=`<div class="caixa"><strong>Checklist de preparação</strong>
     ${tdef?`<p class="nota atrasada">Checklist específico de "${esc(a.prepTipo)}" ainda a definir pela JS Advocacia. Só os itens gerais estão aplicados. A direção pode configurar na aba Checklists do painel.</p>`:(cfgCk[a.prepTipo]&&cfgCk[a.prepTipo].confirmado?"":`<p class="nota">Checklist sugerido a partir dos modelos do escritório, ainda não confirmado pela direção.</p>`)}
     ${ck.length?ck.map(i=>`<div class="item"><label class="itemNome"><input type="checkbox" data-ck="${i.id}" ${i.feito||i.dispensa?"checked":""} ${i.dispensa?"disabled":""}> ${esc(i.t)}</label>${i.o?badge("Obrigatório","warning"):badge("Opcional","outline")}${i.dispensa?`<span class="nota">Dispensado por ${esc(i.dispensa.por)} em ${dataBr(i.dispensa.em)}: ${esc(i.dispensa.just)}</span>`:(i.o&&!i.feito?`<button class="btn sm ghost" data-act="ckDispensar" data-id="${i.id}">Dispensar</button>`:"")}</div>`).join(""):`<p class="nota">Nenhum item. Defina o tipo de demanda e inicie a preparação.</p>`}
     <div class="linhaLink"><input type="text" id="novoCk" placeholder="Novo item"><label class="nota"><input type="checkbox" id="novoCkObr"> Obrigatório</label><button class="btn outline" data-act="ckAdd">${ico("mais",14)} Incluir</button></div>
     <p class="nota">${falta.length?falta.length+" item(ns) obrigatório(s) pendente(s).":"Todos os itens obrigatórios concluídos ou dispensados."}</p></div>`;
    // pendências
    const pd=a.prepPendencias||[];
    h+=`<div class="caixa"><strong>Pendências do caso</strong>
     ${pd.length?`<div class="tabwrap"><table><thead><tr><th>O que falta</th><th>Tipo</th><th>Quem resolve</th><th>Próxima ação</th><th>Prevista</th><th></th></tr></thead><tbody>${pd.map(p=>`<tr class="${p.situacao==="resolvida"?"feito":""}"><td>${esc(p.texto)}</td><td>${badge(p.tipo==="cliente"?"Com o cliente":"Interna",p.tipo==="cliente"?"warning":"secondary")}</td><td>${esc(p.quem||"")}</td><td>${esc(p.proxima||"")}</td><td>${p.data?dataBr(p.data):""}</td><td style="text-align:right"><button class="btn sm outline" data-act="pendRes" data-id="${p.id}">${p.situacao==="resolvida"?"Reabrir":"Resolver"}</button></td></tr>`).join("")}</tbody></table></div>`:`<p class="nota">Nenhuma pendência.</p>`}
     <div class="etapaCampos"><label class="campo"><span class="rotulo">O que falta</span><input type="text" id="pdTexto"></label>
      <label class="campo"><span class="rotulo">Tipo</span><select id="pdTipo"><option value="cliente">Com o cliente</option><option value="interna">Providência interna</option></select></label>
      <label class="campo"><span class="rotulo">Quem resolve</span><input type="text" id="pdQuem" placeholder="Cliente ou responsável"></label>
      <label class="campo"><span class="rotulo">Próxima ação</span><input type="text" id="pdProx"></label>
      <label class="campo"><span class="rotulo">Data prevista</span><input type="date" id="pdData"></label></div>
     <div class="acoes"><button class="btn outline" data-act="pendAdd">${ico("mais",14)} Incluir pendência</button></div></div>`;
    // peça e revisão
    const vs=a.prepVersoes||[];const rv=a.prepRevisoes||[];const ultV=vs[vs.length-1];
    const aprov=ultV&&rv.some(r=>r.resultado==="aprovada"&&r.versao===ultV.n);
    h+=`<div class="caixa"><strong>Peça ou requerimento e revisão</strong>
     ${vs.length?`<ul class="nota">${vs.map(v=>`<li>Versão ${v.n} (${fmtDHL(v.em)}): ${esc(v.desc)}${/^https:\/\//.test(v.link||"")?` · <a href="${esc(v.link)}" target="_blank" rel="noopener noreferrer">abrir</a>`:""}</li>`).join("")}</ul>`:`<p class="nota">Nenhuma versão registrada.</p>`}
     ${e==="preparacao"?`<div class="etapaCampos"><label class="campo"><span class="rotulo">O que é esta versão</span><input type="text" id="vDesc" placeholder="Ex.: petição inicial, 1ª versão"></label><label class="campo"><span class="rotulo">Link do arquivo (opcional)</span><input type="text" id="vLink" placeholder="https://..."></label></div>
      <div class="acoes"><button class="btn" data-act="prepEnviarRev">Enviar esta versão para revisão</button></div>`:""}
     ${rv.length?`<h3 class="sec">Revisões</h3><ul class="nota">${rv.map(r=>`<li>${fmtDHL(r.em)}: ${r.resultado==="aprovada"?"aprovada":"devolvida para ajustes"} por ${esc(r.quem)} (versão ${r.versao})${r.correcoes?" · "+esc(r.correcoes):""}</li>`).join("")}</ul>`:""}
     ${e==="revisao"?`<div class="acoes"><button class="btn" data-act="revAprovar">Aprovar a versão ${ultV?ultV.n:""}</button><button class="btn outline" data-act="revDevolver">Devolver para ajustes</button>${aprov?`<button class="btn" data-act="prepLiberar">Liberar para protocolo</button>`:""}</div>
      ${aprov&&ckFalta(a).length?`<p class="nota atrasada">Para liberar, conclua ou dispense os itens obrigatórios do checklist.</p>`:""}`:""}</div>`;
  }
  // protocolo
  if(e==="pronto"||e==="protocolado"){
    const p=a.prepProtocolo;
    h+=e==="protocolado"&&p?`<div class="caixa"><strong>Protocolo registrado</strong><p class="nota">Data: ${dataBr(p.data)} · Responsável: ${esc(p.responsavel)} · Número: ${esc(p.numero)}${p.comprovante?" · Comprovante: "+(/^https:\/\//.test(p.comprovante)?`<a href="${esc(p.comprovante)}" target="_blank" rel="noopener noreferrer">abrir</a>`:esc(p.comprovante)):""}</p></div>`
     :`<div class="caixa"><strong>Registrar protocolo</strong><p class="nota">Registra o ato já realizado pela equipe. O sistema não protocola nada.</p><div class="etapaCampos">
       <label class="campo"><span class="rotulo">Data do protocolo</span><input type="date" id="ptData" value="${hojeIso()}"></label>
       <label class="campo"><span class="rotulo">Responsável</span><input type="text" id="ptResp" list="pessoasFech" value="${esc(a.prepResponsavel)}"></label>
       <label class="campo"><span class="rotulo">${a.prepVia==="prev_adm"?"Número do protocolo":"Número do processo"}</span><input type="text" id="ptNum"></label>
       <label class="campo"><span class="rotulo">Comprovante (link ou descrição)</span><input type="text" id="ptComp"></label></div>
       <div class="acoes"><button class="btn" data-act="registrarProtocolo">Registrar protocolo</button></div></div>`;
  }
  h+=`<div class="acoes"><button class="btn outline" data-act="devolver">Devolver ao Pós-contrato (documentação)</button></div>`;
  return h;
}
function pgJuridico(){
  const tab=ui.jurTab||"painel";
  const base=itens.filter(a=>!a.arquivado&&a.situacaoMinuta!=="nao_iniciada");
  const f=ui.jf||{};
  const lista=base.filter(a=>(!f.area||a.area===f.area)&&(!f.tipo||a.prepTipo===f.tipo)&&(!f.resp||a.prepResponsavel===f.resp)&&(!f.et||etapaPrep(a)===f.et));
  const ct=k=>base.filter(a=>etapaPrep(a)===k).length;
  const venc=base.filter(prazoVencido).length;
  const resps=[...new Set([...PESSOAS,...base.map(a=>a.prepResponsavel).filter(Boolean)])];
  const sel=(k,rot,ops)=>`<select data-jf="${k}" style="width:auto;min-width:150px" aria-label="${rot}"><option value="">${rot}</option>${ops.map(([v,t])=>`<option value="${esc(v)}" ${f[k]===v?"selected":""}>${esc(t)}</option>`).join("")}</select>`;
  let corpo="";
  if(tab==="painel"){
    corpo=`<div class="kpis">${PREP_ET.map(([k,r])=>`<button type="button" class="kpi kpib ${f.et===k?"on":""} ${(k==="revisao"||k==="pronto")&&ct(k)?"al":""}" data-act="jfEt" data-v="${k}"><b>${ct(k)}</b><span>${r}</span></button>`).join("")}<div class="kpi ${venc?"al":""}"><b>${venc}</b><span>Prazo interno vencido</span></div></div>
    <div class="acoes" style="margin-bottom:.75rem">${sel("area","Todas as áreas",Object.entries(AREAS))}${sel("tipo","Todos os tipos",todosTipos().map(t=>[t,t]))}${sel("resp","Todos os responsáveis",resps.map(r=>[r,r]))}${sel("et","Todas as etapas",PREP_ET)}</div>
    <div class="tabwrap"><table><thead><tr><th>Cliente e demanda</th><th>Responsável</th><th>Etapa</th><th>Pendência principal</th><th>Próxima ação (quem)</th><th>Prazo interno</th><th>Prazo oficial</th></tr></thead><tbody>
    ${lista.length?lista.sort((x,y)=>(prazoVencido(y)?1:0)-(prazoVencido(x)?1:0)).map(a=>{const e=etapaPrep(a);const p=pendPrincipal(a);const n=proximaAcaoPrep(a);
     return `<tr class="linha" data-go="/atendimento/${a.id}?aba=minuta"><td><strong>${esc(a.nome)}</strong><div class="nota">${esc(AREAS[a.area]||"")} · ${esc(a.prepTipo||a.assunto||"tipo a definir")}</div></td><td>${esc(a.prepResponsavel||"—")}</td><td>${badge(rotEt(e),e==="protocolado"?"success":e==="revisao"||e==="pronto"?"warning":"secondary")}</td>
     <td>${p?`${esc(p.texto)}<div class="nota">${p.tipo==="cliente"?"Com o cliente":"Interna"}</div>`:"—"}</td><td>${esc(n.acao)}${n.quem?`<div class="nota">${esc(n.quem)}</div>`:""}</td>
     <td class="${prazoVencido(a)?"atrasada":""}">${a.prepPrazoInterno?dataBr(a.prepPrazoInterno)+(prazoVencido(a)?" (vencido)":""):"—"}</td><td>${a.prepPrazoOficial?dataBr(a.prepPrazoOficial):"—"}${a.prepPrazoOficialDesc?`<div class="nota">${esc(a.prepPrazoOficialDesc)}</div>`:""}</td></tr>`}).join(""):`<tr><td colspan="7" class="vazio">Nenhum caso neste filtro.</td></tr>`}</tbody></table></div>
    ${blocoPrazos()}`;
  }else corpo=painelChecklists();
  return cabecalho("Preparação do caso","Do encaminhamento da ficha até o protocolo, com checklist, pendências e revisão.")
   +tabsH([["painel","Painel"],["checklists","Checklists"]],tab,"jurTab")+`<div class="painel">${corpo}</div>`;
}
function painelChecklists(){
  const k=ui.ckKind||"prep";
  return `<label class="campo" style="max-width:26rem;margin-bottom:.75rem"><span class="rotulo">Checklist de</span><select data-ckkind="1"><option value="prep" ${k==="prep"?"selected":""}>Preparação do caso</option><option value="docs" ${k==="docs"?"selected":""}>Documentos do pós-contrato</option></select></label>`+(k==="docs"?painelChecklistsDocs():painelChecklistsPrep());
}
function painelChecklistsPrep(){
  const tipo=ui.ckTipo||todosTipos()[0];const c=checklistDe(tipo);const salvo=cfgCk[tipo]&&cfgCk[tipo].itens;
  return `<p class="nota">Configure os itens de cada tipo de demanda e marque quais são obrigatórios. A mudança vale para os próximos casos; os casos já em preparação mantêm o checklist que receberam.</p>
  <label class="campo" style="max-width:26rem"><span class="rotulo">Tipo de demanda</span><select data-cktipo="1">${todosTipos().map(t=>`<option ${t===tipo?"selected":""}>${esc(t)}</option>`).join("")}</select></label>
  ${c.aDefinir&&!salvo?`<p class="nota atrasada">Sem checklist específico definido para este tipo. Só os itens gerais estão sugeridos.</p>`:(!(cfgCk[tipo]&&cfgCk[tipo].confirmado)?`<p class="nota">Itens sugeridos a partir dos modelos do escritório. Confirme ou ajuste.</p>`:`<p class="nota">${badge("Definido pela direção","success")}</p>`)}
  ${c.itens.map((i,n)=>`<div class="item"><span class="itemNome">${esc(i.t)}</span><label class="nota"><input type="checkbox" data-ckobr="${n}" ${i.o?"checked":""}> Obrigatório</label><button class="btn ghost sm ico" aria-label="Remover item" data-act="ckCfgRem" data-n="${n}">${ico("lixo",14)}</button></div>`).join("")}
  <div class="linhaLink"><input type="text" id="cfgNovo" placeholder="Novo item do checklist"><label class="nota"><input type="checkbox" id="cfgNovoObr"> Obrigatório</label><button class="btn outline" data-act="ckCfgAdd">${ico("mais",14)} Incluir</button></div>
  <div class="acoes" style="margin-top:.75rem"><button class="btn" data-act="ckCfgConfirmar">Marcar como definido pela direção</button></div>`;
}
async function salvarCfgCk(tipo,obj){
  cfgCk[tipo]=obj;render(true);
  if(db){try{await db.collection("config").doc("checklists").set({tipos:cfgCk})}catch(e){aviso("Não consegui salvar o checklist ("+(e&&e.code||"erro")+").")}}
}

function pgClientes(){
  const t=ui.busca.trim().toLowerCase();
  const aba=ui.cliTab||"tram";
  const lista=[...itens].filter(a=>filtraBusca(a,t)).sort((x,y)=>(x.nome||"").localeCompare(y.nome||"","pt-BR"));
  const comerc=`<div class="tabwrap"><table><thead><tr><th>Nome</th><th>Telefone</th><th>Área</th><th>Situação</th></tr></thead><tbody>
   ${lista.length?lista.map(a=>`<tr class="linha" data-go="/atendimento/${a.id}"><td><strong>${esc(a.nome)}</strong><div class="nota">${esc(a.assunto)}</div></td><td>${esc(a.telefone)}</td><td>${AREAS[a.area]||""}</td><td>${badge(a.situacaoContratacao==="assinada"?"Cliente":"Contato",a.situacaoContratacao==="assinada"?"success":"secondary")}</td></tr>`).join(""):`<tr><td colspan="4" class="vazio">Nenhum atendimento ainda.</td></tr>`}</tbody></table></div>`;
  return cabecalho("Clientes","Clientes do Tramitação Inteligente e contatos do Comercial.")
   +tabsH([["tram","Clientes do Tramitação"],["com","Atendimentos do Comercial"]],aba,"cliTab")
   +`<div class="busca">${ico("busca",16)}<input type="search" id="busca" value="${esc(ui.busca)}" placeholder="Buscar por nome, CPF ou telefone..."></div>`
   +(aba==="tram"?listaTram(t):comerc);
}
function pgAgenda(){
  const hoje=hojeIso();const ev=[];
  itens.forEach(a=>{
    if(a.reuniaoEm&&a.situacaoEntrevista!=="realizada"&&a.situacaoEntrevista!=="ficha_revisada")ev.push({q:a.reuniaoEm.slice(0,16),tipo:"Reunião",a,txt:"Atendimento por ligação"});
    a.tarefas.forEach(t=>{if(t.situacao!=="concluida"&&t.data)ev.push({q:t.data,tipo:"Tarefa",a,txt:t.titulo})});
    if(a.triagem==="talvez_futuro"&&a.retomarEm)ev.push({q:a.retomarEm,tipo:"Retomar contato",a,txt:"Talvez no futuro"});
  });
  ev.sort((x,y)=>x.q.localeCompare(y.q));
  return cabecalho("Agenda e prazos","Reuniões, tarefas e retornos marcados.")
   +`<div class="tabwrap"><table><thead><tr><th>Quando</th><th>Tipo</th><th>Cliente</th><th>O que</th></tr></thead><tbody>
   ${ev.length?ev.map(e=>{const d=e.q.slice(0,10);return `<tr class="linha" data-go="/atendimento/${e.a.id}"><td class="${d<hoje?"atrasada":""}">${dataBr(d)}${e.q.length>10?" "+e.q.slice(11,16):""}${d<hoje?" (atrasada)":""}</td><td>${badge(e.tipo,"outline")}</td><td><strong>${esc(e.a.nome)}</strong></td><td>${esc(e.txt)}</td></tr>`}).join(""):`<tr><td colspan="4" class="vazio">Nada marcado.</td></tr>`}</tbody></table></div>
   ${blocoPrazos()}`;
}
let mGrupo="Comercial",mId=null,mCtx={cli:"",trat:"voce",nome:"",data:"",hora:"",local:"",link:"",documentos:"",prazo:"",modalidade:"",vr:"",vh:"",vl:""};
function pgBiblioteca(){
  return cabecalho("Biblioteca","Mensagens prontas e procedimentos do escritório.")
   +tabsH([["mensagens","Mensagens prontas"],["pops","POPs"]],ui.bibTab,"bibTab")
   +`<div class="painel">${ui.bibTab==="pops"?`<p class="nota">Os procedimentos operacionais (POPs) ainda serão trazidos do sistema antigo.</p>`:`<div class="mgrupos" id="grupos"></div><div class="mgrid"><div class="mlista" id="mlista"></div><div id="mcaixa"></div></div>`}</div>`;
}
function mTexto(m){
  const sexo=mCtx.trat==="senhora"?"Feminino":mCtx.trat==="senhor"?"Masculino":null;
  const a=porId(mCtx.cli);const nome=(mCtx.nome||(a&&a.nome)||"").trim().split(/\s+/)[0]||"[nome]";
  return m.texto({nome,tratamento:mCtx.trat,sexo,data:mCtx.data,hora:mCtx.hora,local:mCtx.local,link:mCtx.link,documentos:mCtx.documentos,prazo:mCtx.prazo,modalidade:mCtx.modalidade,valorRecebido:mCtx.vr,valorHonorarios:mCtx.vh,valorLiquido:mCtx.vl});
}
function renderMsg(){
  if(!$("#grupos"))return;
  $("#grupos").innerHTML=MSG.GRUPOS.map(g=>`<button type="button" data-g="${esc(g)}" aria-pressed="${g===mGrupo}">${esc(g)}</button>`).join("");
  $$("#grupos button").forEach(b=>b.onclick=()=>{mGrupo=b.dataset.g;mId=null;renderMsg()});
  const lista=MSG.MENSAGENS.filter(m=>m.grupo===mGrupo).sort((a,b)=>(b.favorita?1:0)-(a.favorita?1:0));
  if(!mId||!lista.find(m=>m.id===mId))mId=lista[0]&&lista[0].id;
  $("#mlista").innerHTML=lista.map(m=>`<button type="button" class="mitem" data-id="${esc(m.id)}" aria-pressed="${m.id===mId}">${esc(m.fase)}${m.favorita?"<small>Favorita</small>":""}</button>`).join("");
  $$("#mlista .mitem").forEach(b=>b.onclick=()=>{mId=b.dataset.id;renderMsg()});
  renderCaixa();
}
function renderCaixa(){
  const m=MSG.MENSAGENS.find(x=>x.id===mId);const c=$("#mcaixa");if(!m){c.innerHTML="";return}
  const cl=itens.filter(a=>a.situacaoMinuta==="nao_iniciada").sort((a,b)=>(a.nome||"").localeCompare(b.nome||"","pt-BR"));
  const has=k=>m.campos.includes(k);
  const campo=(id,rot2,tipo,val)=>`<label>${rot2}<input id="${id}" type="${tipo||"text"}" value="${esc(val||"")}"></label>`;
  c.innerHTML=`<div class="grid2"><label>Cliente do funil (opcional)<select id="m_cli"><option value="">Digitar o nome abaixo</option>${cl.map(a=>`<option value="${esc(a.id)}" ${a.id===mCtx.cli?"selected":""}>${esc(a.nome)}</option>`).join("")}</select></label>
   <label>Tratamento<select id="m_trat">${[["voce","Você"],["senhor","O senhor"],["senhora","A senhora"],["neutro","O(a) senhor(a)"]].map(([v,t])=>`<option value="${v}" ${v===mCtx.trat?"selected":""}>${t}</option>`).join("")}</select></label></div>
   ${mCtx.cli?"":campo("m_nome","Nome do cliente","text",mCtx.nome)}
   <div class="grid2">${has("data")?campo("m_data","Data","date",mCtx.data):""}${has("hora")?campo("m_hora","Hora","time",mCtx.hora):""}${has("local")?campo("m_local","Local","text",mCtx.local):""}${has("link")?campo("m_link","Link","text",mCtx.link):""}${has("documentos")?campo("m_doc","Documentos","text",mCtx.documentos):""}${has("prazo")?campo("m_prazo","Prazo","text",mCtx.prazo):""}${has("modalidade")?campo("m_mod","Modalidade","text",mCtx.modalidade):""}${has("valorRecebido")?campo("m_vr","Valor recebido","text",mCtx.vr):""}${has("valorHonorarios")?campo("m_vh","Valor dos honorários","text",mCtx.vh):""}${has("valorLiquido")?campo("m_vl","Valor líquido","text",mCtx.vl):""}</div>
   ${m.aviso?`<div class="avisoM">${esc(m.aviso)}</div>`:""}
   <label>Mensagem (pode editar antes de enviar)<textarea id="m_texto"></textarea></label>
   <div class="acoes"><button class="btn" type="button" id="m_copiar">Copiar</button><a class="btn outline" id="m_wa" target="_blank" rel="noopener noreferrer">Abrir no WhatsApp</a><span id="m_ok" style="align-self:center;color:var(--success);font-weight:600;font-size:.88rem"></span></div>`;
  const refresca=()=>{const tx=mTexto(m);$("#m_texto").value=tx;const a=porId(mCtx.cli);$("#m_wa").href=MSG.linkWhatsapp(a?a.telefone:"",$("#m_texto").value)};
  const lig=(id,k)=>{const e=$("#"+id);if(e)e.oninput=()=>{mCtx[k]=e.value;refresca()}};
  lig("m_nome","nome");lig("m_data","data");lig("m_hora","hora");lig("m_local","local");lig("m_link","link");lig("m_doc","documentos");lig("m_prazo","prazo");lig("m_mod","modalidade");lig("m_vr","vr");lig("m_vh","vh");lig("m_vl","vl");
  $("#m_cli").onchange=e=>{mCtx.cli=e.target.value;renderCaixa()};
  $("#m_trat").onchange=e=>{mCtx.trat=e.target.value;refresca()};
  $("#m_texto").oninput=()=>{const a=porId(mCtx.cli);$("#m_wa").href=MSG.linkWhatsapp(a?a.telefone:"",$("#m_texto").value)};
  $("#m_copiar").onclick=async()=>{const el=$("#m_texto");try{await navigator.clipboard.writeText(el.value);$("#m_ok").textContent="Copiado"}catch(e){el.select();$("#m_ok").textContent="Selecionado: use Ctrl+C"}};
  refresca();
}

/* ---------- roteamento e render ---------- */
const NAV=[["hoje","Hoje","/"],["comercial","Comercial","/comercial"],["posvenda","Pós-contrato","/posvenda"],["juridico","Preparação do caso","/juridico"],["clientes","Clientes","/clientes"],["fechamentos","Fechamentos","/fechamentos"],["agenda","Agenda e prazos","/agenda"],["biblioteca","Biblioteca","/biblioteca"]];
function go(path){
  let [p,q]=path.split("?");const seg=p.split("/").filter(Boolean);
  const nome=seg[0]||"hoje";
  rota={nome:["hoje","comercial","posvenda","juridico","clientes","fechamentos","agenda","biblioteca","atendimento"].includes(nome)?nome:"hoje",id:seg[1]||null};
  ui.abaAt=null;ui.confirmaExcluir=null;
  if(q){const pr=new URLSearchParams(q);if(pr.get("aba"))ui.abaAt=pr.get("aba")}
  if(rota.nome!=="clientes"&&rota.nome!=="comercial")ui.busca=ui.busca;
  try{history.replaceState(null,"","#"+path)}catch(e){}
  render(true);window.scrollTo(0,0);
}
function render(forte){
  const ativo=document.activeElement;
  if(!forte&&ativo&&/^(INPUT|TEXTAREA|SELECT)$/.test(ativo.tagName)&&$("#view").contains(ativo)&&ativo.id!=="busca")return;
  const foco=ativo&&ativo.id==="busca"?ativo.selectionStart:null;
  const nomeNav=rota.nome==="atendimento"?"comercial":rota.nome;
  $("#nav").innerHTML=NAV.map(([k,r,p])=>`<a href="#" data-go="${p}" class="${k===nomeNav?"on":""}">${ico(k==="hoje"?"hoje":k)}<span>${r}</span></a>`).join("");
  let h="";
  if(rota.nome==="hoje")h=pgHoje();else if(rota.nome==="comercial")h=pgComercial();else if(rota.nome==="atendimento")h=pgAtendimento(rota.id);
  else if(rota.nome==="posvenda")h=pgPosVenda();else if(rota.nome==="juridico")h=pgJuridico();else if(rota.nome==="clientes")h=pgClientes();else if(rota.nome==="agenda")h=pgAgenda();else if(rota.nome==="fechamentos")h=pgFechamentos();else if(rota.nome==="biblioteca")h=pgBiblioteca();
  const rasc=forte?null:$$("#view input[id],#view textarea[id],#view select[id]").filter(e=>e.id!=="busca"&&e.type!=="checkbox").map(e=>[e.id,e.value]);
  $("#view").innerHTML=h;
  if(rasc)rasc.forEach(([id,v])=>{const e=document.getElementById(id);if(e&&v&&e.value!==v&&!e.dataset.blur)e.value=v});
  if(rota.nome==="biblioteca")renderMsg();
  iniciaPrazosHoje();
  if(foco!==null){const b=$("#busca");if(b){b.focus();try{b.setSelectionRange(foco,foco)}catch(e){}}}
  if(rota.nome==="atendimento"){const a=porId(rota.id);if(a)document.title=a.nome+" | Atendimento"}else document.title="Escritório Online";
}

/* ---------- modal ---------- */
function modal(h){const m=$("#modal");m.innerHTML=`<div class="dlg" role="dialog" aria-modal="true">${h}</div>`;m.classList.add("on")}
function fechar(){const m=$("#modal");m.classList.remove("on");m.innerHTML=""}
$("#modal").addEventListener("mousedown",e=>{if(e.target.id==="modal")fechar()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")fechar()});
function novoLead(){
  modal(`<h2>Novo lead</h2><div class="formN">
   <label class="campo"><span class="rotulo">Nome</span><input type="text" id="l_nome" placeholder="Nome do contato"></label>
   <label class="campo"><span class="rotulo">Telefone</span><input type="tel" id="l_tel" placeholder="(00) 00000-0000" inputmode="tel"></label>
   <label class="campo"><span class="rotulo">De onde veio</span><select id="l_orig"><option value="">Escolha a origem</option>${ORIGENS.map(o=>`<option>${o}</option>`).join("")}</select></label>
   <label class="campo"><span class="rotulo">Área</span><select id="l_area">${opts(AREAS,"trabalhista")}</select></label>
   <label class="campo"><span class="rotulo">Assunto (opcional)</span><input type="text" id="l_ass" placeholder="Ex.: sem registro na carteira; BPC/LOAS"></label>
   <p class="nota" style="margin:0">O contato entra em Clientes como contato e só vira cliente quando o contrato for marcado como assinado. Depois de criar, você faz a triagem na tela do atendimento.</p></div>
   <div class="rod"><button class="btn outline" data-act="fechar">Cancelar</button><button class="btn" id="l_ok" data-act="criarLead" disabled>Criar e abrir</button></div>`);
  const nm=$("#l_nome");nm.focus();nm.oninput=()=>{$("#l_ok").disabled=!nm.value.trim()};
}

/* situação geral dos documentos acompanha o checklist */
function sitDocs(a,docs){
  if(docs.length&&docs.every(d=>d.situacao==="conferido"||d.situacao==="dispensado"))return"conferidos";
  if(a.situacaoDocumentos==="conferidos")return"parcial";
  return a.situacaoDocumentos;
}
function gravarDocs(a,docs,log){gravar(a.id,{docs,situacaoDocumentos:sitDocs(a,docs)},log)}
/* ---------- ações ---------- */
const ACT={
  puxarPubs:()=>puxarPubs(),
  jurTab:b=>{ui.jurTab=b.dataset.v;render(true)},
  jfEt:b=>{ui.jf=ui.jf||{};ui.jf.et=ui.jf.et===b.dataset.v?"":b.dataset.v;render(true)},
  prepIniciar:()=>{const a=porId(rota.id);if(!a)return;
    if(!a.prepTipo||!a.prepVia){aviso("Escolha o tipo de demanda e a via de atuação para iniciar a preparação.");return}
    const ck=(a.prepChecklist||[]).length?a.prepChecklist:checklistDe(a.prepTipo).itens.map(i=>({id:uid(),t:i.t,o:i.o,feito:false}));
    setPrep(a,"preparacao",{prepChecklist:ck},"Análise concluída: "+a.prepTipo+" ("+VIAS[a.prepVia]+"). Preparação iniciada");render(true)},
  ckDispensar:b=>{const a=porId(rota.id);if(!a)return;const it=(a.prepChecklist||[]).find(i=>i.id===b.dataset.id);if(!it)return;
    const por=(prompt("Quem dispensa este item? (advogada responsável)",a.prepResponsavel||"Dra. Jackeline")||"").trim();if(!por)return;
    const just=(prompt("Justificativa da dispensa de: "+it.t)||"").trim();if(just.length<5){aviso("A dispensa exige uma justificativa.");return}
    gravar(a.id,{prepChecklist:(a.prepChecklist||[]).map(i=>i.id===it.id?{...i,dispensa:{por,em:hojeIso(),just}}:i)},"Item dispensado do checklist: "+it.t+". Por "+por+". Justificativa: "+just);render(true)},
  ckAdd:()=>{const a=porId(rota.id);const v=($("#novoCk")||{}).value.trim();if(!a||!v)return;gravar(a.id,{prepChecklist:[...(a.prepChecklist||[]),{id:uid(),t:v,o:!!$("#novoCkObr").checked,feito:false}]},"Item incluído no checklist: "+v);render(true)},
  pendAdd:()=>{const a=porId(rota.id);const t=($("#pdTexto")||{}).value.trim();if(!a||!t){aviso("Diga o que falta.");return}
    const p={id:uid(),texto:t,tipo:$("#pdTipo").value,quem:$("#pdQuem").value.trim(),proxima:$("#pdProx").value.trim(),data:$("#pdData").value,situacao:"aberta"};
    gravar(a.id,{prepPendencias:[...(a.prepPendencias||[]),p]},"Pendência ("+(p.tipo==="cliente"?"com o cliente":"interna")+"): "+t);render(true)},
  pendRes:b=>{const a=porId(rota.id);if(!a)return;const p=(a.prepPendencias||[]).find(x=>x.id===b.dataset.id);if(!p)return;const nova=p.situacao==="resolvida"?"aberta":"resolvida";
    gravar(a.id,{prepPendencias:(a.prepPendencias||[]).map(x=>x.id===p.id?{...x,situacao:nova}:x)},"Pendência "+(nova==="resolvida"?"resolvida":"reaberta")+": "+p.texto);render(true)},
  prepEnviarRev:()=>{const a=porId(rota.id);if(!a)return;const d=($("#vDesc")||{}).value.trim();if(!d){aviso("Descreva a versão que vai para revisão.");return}
    const n=(a.prepVersoes||[]).length+1;
    setPrep(a,"revisao",{prepVersoes:[...(a.prepVersoes||[]),{n,em:agoraIso(),desc:d,link:($("#vLink")||{}).value.trim()}]},"Versão "+n+" enviada para revisão: "+d);render(true)},
  revAprovar:()=>{const a=porId(rota.id);if(!a)return;const v=(a.prepVersoes||[]).slice(-1)[0];if(!v)return;
    const q=(prompt("Quem revisou?",a.prepResponsavel||"Dra. Jackeline")||"").trim();if(!q)return;
    gravar(a.id,{prepRevisoes:[...(a.prepRevisoes||[]),{em:agoraIso(),quem:q,resultado:"aprovada",versao:v.n,correcoes:""}]},"Revisão: versão "+v.n+" aprovada por "+q);render(true)},
  revDevolver:()=>{const a=porId(rota.id);if(!a)return;const v=(a.prepVersoes||[]).slice(-1)[0];if(!v)return;
    const q=(prompt("Quem revisou?",a.prepResponsavel||"Dra. Jackeline")||"").trim();if(!q)return;
    const c=(prompt("Quais correções são necessárias? (obrigatório)")||"").trim();if(c.length<5){aviso("Informe as correções solicitadas.");return}
    setPrep(a,"preparacao",{prepRevisoes:[...(a.prepRevisoes||[]),{em:agoraIso(),quem:q,resultado:"devolvida",versao:v.n,correcoes:c}]},"Revisão: versão "+v.n+" devolvida por "+q+". Correções: "+c);render(true)},
  prepLiberar:()=>{const a=porId(rota.id);if(!a)return;const v=(a.prepVersoes||[]).slice(-1)[0];
    const ok=v&&(a.prepRevisoes||[]).some(r=>r.resultado==="aprovada"&&r.versao===v.n);
    if(!ok){aviso("A versão atual ainda não foi aprovada na revisão.");return}
    const f=ckFalta(a);if(f.length){aviso("Faltam itens obrigatórios do checklist: "+f.map(i=>i.t).join("; ")+". Conclua ou dispense com justificativa.");return}
    setPrep(a,"pronto",{},"Pronto para protocolo (versão "+v.n+" aprovada, itens obrigatórios concluídos)");render(true)},
  registrarProtocolo:()=>{const a=porId(rota.id);if(!a)return;
    const p={data:$("#ptData").value,responsavel:$("#ptResp").value.trim(),numero:$("#ptNum").value.trim(),comprovante:$("#ptComp").value.trim()};
    if(!p.data||!p.responsavel||!p.numero){aviso("Informe data, responsável e "+(a.prepVia==="prev_adm"?"número do protocolo":"número do processo")+".");return}
    if(!confirm("Confirma que o protocolo já foi realizado pela equipe? O sistema não protocola nada."))return;
    setPrep(a,"protocolado",{prepProtocolo:p},"Protocolo registrado em "+dataBr(p.data)+" por "+p.responsavel+". "+(a.prepVia==="prev_adm"?"Protocolo":"Processo")+": "+p.numero);render(true)},
  ckCfgAdd:()=>{const v=($("#cfgNovo")||{}).value.trim();if(!v)return;const tp=ui.ckTipo||todosTipos()[0];const c=checklistDe(tp);salvarCfgCk(tp,{itens:[...c.itens,{t:v,o:!!$("#cfgNovoObr").checked}],confirmado:false})},
  ckCfgRem:b=>{const tp=ui.ckTipo||todosTipos()[0];const c=checklistDe(tp);salvarCfgCk(tp,{itens:c.itens.filter((_,n)=>n!==Number(b.dataset.n)),confirmado:false})},
  ckCfgConfirmar:()=>{const tp=ui.ckTipo||todosTipos()[0];const c=checklistDe(tp);salvarCfgCk(tp,{itens:c.itens,confirmado:true});toast("Checklist marcado como definido")},
  kitEnviado:()=>{const a=porId(rota.id);if(!a||!a.kitGeradoEm)return;const patch={kitEnviadoEm:agoraIso()};
    if(a.situacaoContratacao!=="assinada"&&a.situacaoContratacao!=="nao_fechou")patch.situacaoContratacao="aguardando_assinatura";
    gravar(a.id,patch,"Kit enviado ao cliente"+(patch.situacaoContratacao?". Contrato: aguardando assinatura":""));toast("Envio registrado");render(true)},
  buscarEnv:()=>{const a=porId(rota.id);if(a)buscarEnv(a)},
  vincularEnv:b=>{const a=porId(rota.id);if(!a)return;gravar(a.id,{tramEnvelopeId:String(b.dataset.id),tramErro:""},"Contrato vinculado ao envelope "+b.dataset.id+" do Tramitação");ui.envList&&delete ui.envList[a.id];render(true)},
  consultarAss:()=>{const a=porId(rota.id);if(a)consultarAss(a)},
  reabrir:()=>{const a=porId(rota.id);if(!a)return;gravar(a.id,{situacaoContratacao:"nao_iniciada"},"Atendimento reaberto. Motivo do encerramento anterior: "+(a.motivoEncerramento||"não informado"));render(true)},
  hojeCard:b=>{ui.hojeCard=b.dataset.v;render(true)},
  baixarPrazo:b=>{if(!db)return;db.collection("baixas").doc(String(b.dataset.id)).set({em:agoraIso()}).catch(()=>aviso("Não consegui salvar a marca de conferido."))},
  desfazerBaixa:b=>{if(!db)return;db.collection("baixas").doc(String(b.dataset.id)).delete().catch(()=>aviso("Não consegui desfazer."))},
  kitDoc:b=>{const a=porId(rota.id);if(a)baixarKit(a,[b.dataset.k],false)},
  kitTodos:()=>{const a=porId(rota.id);if(a)baixarKit(a,docsKit(a),true)},
  kitForcar:()=>{const a=porId(rota.id);if(a)baixarKit(a,docsKit(a),true)},
  posFiltro:b=>{ui.posFiltro=b.dataset.v;render(true)},
  cliTab:b=>{ui.cliTab=b.dataset.v;render(true)},
  puxarTram:()=>puxarTram(),
  puxarPrazos:()=>puxarPrazos(),
  abrirTram:b=>{const c=tram.lista.find(x=>String(x.id)===b.dataset.id);if(c)abrirDoTram(c)},
  criarDoTram:()=>criarDoTram(),
  comTab:b=>{ui.comTab=b.dataset.v;render(true)},
  visao:b=>{ui.visao=b.dataset.v;render(true)},
  filtro:b=>{ui.filtro=b.dataset.v;render(true)},
  bibTab:b=>{ui.bibTab=b.dataset.v;render(true)},
  juridicoFiltro:b=>{ui.juridicoFiltro=b.dataset.v;render(true)},
  novoLead:()=>novoLead(),
  fechar:()=>fechar(),
  criarLead:async()=>{
    const nome=$("#l_nome").value.trim();if(!nome)return;
    const dig=v=>String(v||"").replace(/\D/g,"");const tel=dig($("#l_tel").value);let ex=null;
    if(tel.length>=8){ex=itens.find(x=>dig(x.telefone).length>=8&&dig(x.telefone).slice(-8)===tel.slice(-8))||null;
      if(ex&&confirm("Já existe cadastro com este telefone: "+ex.nome+" ("+(AREAS[ex.area]||"")+(ex.assunto?", "+ex.assunto:"")+").\n\nOK: abrir o cadastro existente.\nCancelar: criar uma nova demanda para a mesma pessoa.")){fechar();go("/atendimento/"+ex.id);return}}
    const id=await criar({nome,telefone:$("#l_tel").value.trim(),origem:$("#l_orig").value,area:$("#l_area").value,assunto:$("#l_ass").value.trim(),...(ex?{pessoaVinculada:ex.id,logInicial:"Lead criado como nova demanda da mesma pessoa (cadastro anterior: "+ex.nome+")"}:{})});
    fechar();if(id)go("/atendimento/"+id);
  },
  abrirAba:b=>{ui.abaAt=b.dataset.v;render(true)},
  abrirAba2:b=>{ui.abaAt=b.dataset.v;render(true)},
  setTriagem:b=>{const a=porId(rota.id);gravar(a.id,{triagem:b.dataset.v},"Triagem: "+rot(R_TRIAGEM,b.dataset.v));render(true)},
  setCampo:b=>{const a=porId(rota.id);const c=b.dataset.c,v=b.dataset.v;aplicarSituacao(a,c,v)},
  arquivar:()=>{const a=porId(rota.id);gravar(a.id,{arquivado:!a.arquivado},a.arquivado?"Reaberto":"Arquivado");render(true)},
  excluir:async()=>{const a=porId(rota.id);if(ui.confirmaExcluir===a.id){try{await col.doc(a.id).delete()}catch(e){aviso("Não foi possível excluir agora.");return}go("/comercial")}else{ui.confirmaExcluir=a.id;render(true)}},
  copiarMinuta:async()=>{
    const a=porId(rota.id);const r=a.ficha.respostas||{};const perg=FICHA.f[a.area]||[];
    let t=`ATENDIMENTO: ${a.nome}\nÁrea: ${AREAS[a.area]}\nAssunto: ${a.assunto||"—"}\nTelefone: ${a.telefone||"—"}\n\nCADASTRO\n`;
    Object.entries(a.cadastro).forEach(([k,v])=>{if(v)t+=`${k}: ${v}\n`});
    t+=`\nFICHA ${a.ficha.revisada?"(revisada)":"(rascunho, ainda não revisada)"}\n`;
    perg.forEach(p=>{const v=r[p.id];if(v&&String(v).trim())t+=`- ${p.texto}\n  ${v}\n`});
    t+=`\nDOCUMENTOS\n`+a.docs.map(d=>`- ${d.nome}: ${rot(R_DOCITEM,d.situacao)}`).join("\n");
    t+=`\n\nOBSERVAÇÕES\n${a.observacoes||"—"}\n`;
    try{await navigator.clipboard.writeText(t);toast(a.ficha.revisada?"Copiado. Este é o material que o Jurídico usa para fazer a minuta.":"Copiado, mas a ficha ainda é rascunho: revise antes de enviar ao Jurídico.")}catch(e){aviso("Não consegui copiar. Tente de novo.")}
  },
  docAdd:()=>{const a=porId(rota.id);const v=$("#novoDoc").value.trim();if(!v)return;gravarDocs(a,[...a.docs,{id:uid(),nome:v,situacao:"solicitado"}],"Documento incluído no checklist: "+v);render(true)},
  docRem:b=>{const a=porId(rota.id);gravarDocs(a,a.docs.filter(d=>d.id!==b.dataset.d));render(true)},
  docsTodos:b=>{const a=porId(rota.id);const v=b.dataset.v;if(v==="solicitado"&&!confirm('Desmarcar todos? Todos os itens voltam para "Solicitado".'))return;gravarDocs(a,a.docs.map(d=>({...d,situacao:v})),v==="conferido"?"Todos os documentos conferidos":"Documentos voltaram para Solicitado");render(true)},
  criarChecklist:()=>{const a=porId(rota.id);gravar(a.id,{docs:CHECKLIST[a.area].map(n=>({id:uid(),nome:n,situacao:"solicitado"}))},"Checklist de documentos criado");render(true)},
  tarAdd:()=>{const a=porId(rota.id);const v=$("#novaTar").value.trim();if(!v)return;gravar(a.id,{tarefas:[...a.tarefas,{id:uid(),titulo:v,data:$("#novaTarData").value||"",situacao:"pendente"}]});render(true)},
  tarRem:b=>{const a=porId(rota.id);gravar(a.id,{tarefas:a.tarefas.filter(t=>t.id!==b.dataset.t)});render(true)},
  concluirTarefa:b=>{const a=porId(b.dataset.id);gravar(a.id,{tarefas:a.tarefas.map(t=>t.id===b.dataset.t?{...t,situacao:"concluida"}:t)});render(true)},
  registrarContato:b=>{const a=porId(b.dataset.id);const m=Number(b.dataset.m);gravar(a.id,{ultimoContatoEm:agoraIso(),followupEm:new Date(Date.now()+m*60000).toISOString()},"Contato registrado");toast("Contato registrado");render(true)},
  verMensagens:b=>{mCtx.cli=b.dataset.id;mGrupo="Comercial";mId=null;ui.bibTab="mensagens";go("/biblioteca")},
  copiarFu:async()=>{try{await navigator.clipboard.writeText($("#fuMsg").value);toast("Mensagem copiada")}catch(e){aviso("Não consegui copiar.")}},
  assunto:b=>{const a=porId(rota.id);const v=b.dataset.v;const l=a.ficha.assuntos.includes(v)?a.ficha.assuntos.filter(x=>x!==v):[...a.ficha.assuntos,v];gravar(a.id,{ficha:{assuntos:l}});a.ficha.assuntos=l;render(true)},
  revisarFicha:()=>{const a=porId(rota.id);gravar(a.id,{ficha:{revisada:true},situacaoEntrevista:"ficha_revisada"},"Ficha do pré-atendimento revisada");a.ficha.revisada=true;render(true)},
  reabrirFicha:()=>{const a=porId(rota.id);gravar(a.id,{ficha:{revisada:false},situacaoEntrevista:"realizada"},"Ficha reaberta para revisão");a.ficha.revisada=false;render(true)},
  jur:b=>{const a=porId(rota.id);const v=b.dataset.v;
    if(v==="protocolada"&&!confirm("Confirma que a petição foi protocolada? O sistema não protocola nada sozinho."))return;
    gravar(a.id,{situacaoMinuta:v},v==="em_revisao"?"Jurídico: análise concluída, em produção":v==="aprovada"?"Jurídico: minuta pronta para protocolo":"Jurídico: protocolo registrado");render(true)}
};
/* ---------- ações do pós-contrato ---------- */
const atual=()=>porId(rota.id);
Object.assign(ACT,{
  posFiltro:b=>{ui.pf=Object.assign({},ui.pf,{et:b.dataset.v});render(true)},
  copiarMsg:()=>{const e=$("#posMsg");if(e)copiar(e.value,e)},
  posEnvio:()=>{const a=atual();if(!a)return;
    const r=pedirData("Data de retorno combinada com o cliente (AAAA-MM-DD). Deixe em branco se não houver.","");
    gravar(a.id,{posStatus:"aguardando",fichaEnviadaEm:hojeIso(),posRetornoFicha:r||"",tarefas:(a.tarefas||[]).map(t=>t.id==="ficha_envio"?{...t,situacao:"concluida"}:t)},"Ficha de atendimento enviada ao cliente (envio manual)"+(r?". Retorno em "+dataBr(r):""));render(true)},
  posRecebida:()=>{const a=atual();if(!a)return;
    const ab=pendPosAb(a).filter(p=>p.origem==="ficha");
    const pends=pendPos(a).map(p=>p.origem==="ficha"&&p.situacao!=="resolvida"?{...p,situacao:"resolvida",resolvidaEm:hojeIso(),resolvidaPor:"automático: ficha recebida"}:p);
    gravar(a.id,{posStatus:"recebida",fichaRecebidaEm:hojeIso(),fichaVersoes:snapFicha(a,(a.fichaVersoes||[]).length?"Complemento recebido":"Primeira versão recebida"),posRevEm:"",posPend:pends,ficha:{revisada:false},situacaoEntrevista:a.situacaoEntrevista==="ficha_revisada"?"realizada":a.situacaoEntrevista},
      "Ficha recebida"+(ab.length?" (complemento; "+ab.length+" solicitação(ões) encerrada(s))":"")+". Versões anteriores preservadas. Nova revisão necessária.");render(true)},
  posFichaRev:()=>{const a=atual();if(!a)return;
    if(!a.fichaRecebidaEm&&a.situacaoEntrevista!=="ficha_revisada"){aviso("Registre primeiro a ficha recebida.");return}
    const q=(prompt("Quem revisou a ficha?",a.posResponsavel||"")||"").trim();if(!q)return;
    const patch={posRevisor:q,posRevEm:hojeIso(),ficha:{revisada:true},situacaoEntrevista:"ficha_revisada"};
    if(posSt(a)==="recebida"||posSt(a)==="aguardando")patch.posStatus="em_revisao";
    gravar(a.id,patch,"Ficha revisada por "+q);render(true)},
  posCompl:()=>{const a=atual();if(!a)return;
    const m=(prompt("O que precisa ser complementado na ficha?")||"").trim();if(m.length<3)return;
    const ret=pedirData("Data de retorno combinada com o cliente (AAAA-MM-DD):",addDias(hojeIso(),3))||addDias(hojeIso(),3);
    gravar(a.id,{posStatus:"aguardando",fichaVersoes:snapFicha(a,"Antes do pedido de complemento"),posRevEm:"",ficha:{revisada:false},situacaoEntrevista:a.situacaoEntrevista==="ficha_revisada"?"realizada":a.situacaoEntrevista,
      posPend:[...pendPos(a),{id:uid(),texto:m,tipo:"cliente",resp:"Cliente",proxima:"Aguardar o complemento da ficha",retorno:ret,essencial:true,situacao:"aberta",criadaEm:agoraIso(),origem:"ficha"}]},
      "Complemento da ficha solicitado: "+m+". Retorno em "+dataBr(ret)+". Versão anterior das respostas preservada.");render(true)},
  posPendAdd:()=>{const a=atual();if(!a)return;
    const p={id:uid(),texto:$("#pp_texto").value.trim(),tipo:$("#pp_tipo").value,resp:$("#pp_resp").value.trim(),proxima:$("#pp_prox").value.trim(),retorno:$("#pp_ret").value,essencial:$("#pp_ess").checked,situacao:"aberta",criadaEm:agoraIso(),origem:"manual"};
    if(!p.texto||!p.resp||!p.proxima||!p.retorno){aviso("Informe o que falta, quem resolve, a próxima ação e a data de retorno.");return}
    gravar(a.id,{posPend:[...pendPos(a),p]},"Pendência registrada ("+R_PEND_TIPO[p.tipo]+"): "+p.texto+". Quem resolve: "+p.resp+". Retorno: "+dataBr(p.retorno));
    ["pp_texto","pp_resp","pp_prox","pp_ret"].forEach(i=>{const e=$("#"+i);if(e)e.value=""});render(true)},
  posPendRes:b=>{const a=atual();if(!a)return;const p=pendPos(a).find(x=>x.id===b.dataset.id);if(!p)return;
    gravar(a.id,{posPend:pendPos(a).map(x=>x.id===p.id?{...x,situacao:"resolvida",resolvidaEm:hojeIso()}:x)},"Pendência resolvida: "+p.texto);render(true)},
  posPendRet:b=>{const a=atual();if(!a)return;const p=pendPos(a).find(x=>x.id===b.dataset.id);if(!p)return;
    const r=pedirData("Nova data de retorno (AAAA-MM-DD):",p.retorno||"");if(!r)return;
    gravar(a.id,{posPend:pendPos(a).map(x=>x.id===p.id?{...x,retorno:r}:x)},"Retorno alterado: "+p.texto+" ("+dataBr(p.retorno)+" para "+dataBr(r)+")");render(true)},
  posPendMsg:b=>{ui.pmsg=ui.pmsg===b.dataset.id?null:b.dataset.id;render(true)},
  posPendCopiar:b=>{const e=$("#pm_"+b.dataset.id);if(e)copiar(e.value,e)},
  posPendEnv:b=>{const a=atual();if(!a)return;const p=pendPos(a).find(x=>x.id===b.dataset.id);if(!p)return;
    gravar(a.id,{posPend:pendPos(a).map(x=>x.id===p.id?{...x,enviadoEm:hojeIso()}:x)},"Pedido ao cliente enviado (envio manual): "+p.texto);toast("Envio registrado");render(true)},
  resumoDocs:()=>{const a=atual();if(!a)return;
    const t=a.docs.filter(docOk).map(d=>"- "+d.nome+(d.situacao==="dispensado"?" (dispensado)":"")+(d.arquivo?" ["+d.arquivo+"]":"")).join("\n");
    if(!t){aviso("Nenhum documento conferido ou dispensado ainda.");return}
    gravar(a.id,{posResumo:{...(a.posResumo||{}),docs:t}},"Resumo: documentos disponíveis preenchidos a partir do checklist");render(true)},
  docAb:b=>{ui.docAb=ui.docAb||{};ui.docAb[b.dataset.d]=!ui.docAb[b.dataset.d];render(true)},
  posAplicarDocs:()=>{const a=atual();if(!a)return;
    const novos=docsDoTipo(a).filter(n=>!a.docs.some(d=>d.nome===n.nome));
    if(!novos.length){toast("O checklist já tem todos os itens do tipo");return}
    gravarDocs(a,[...a.docs,...novos],novos.length+" item(ns) do checklist de "+(tipoDemandaDe(a)||"área")+" acrescentado(s)");render(true)},
  docsTodos:b=>{const a=atual();const v=b.dataset.v;
    if(v==="solicitado"){if(!confirm('Desmarcar todos? Os itens (menos os dispensados) voltam para "Pendente de recebimento".'))return;
      gravarDocs(a,a.docs.map(d=>d.situacao==="dispensado"?d:{...d,situacao:"solicitado",conferidoPor:"",conferidoEm:""}),"Documentos desmarcados");render(true);return}
    const q=(prompt("Quem conferiu? (só entram os itens com arquivo registrado)",a.posResponsavel||a.responsavel||"")||"").trim();if(!q)return;
    let sem=0;const docs=a.docs.map(d=>{if(docOk(d))return d;if(!d.arquivo){sem++;return d}return{...d,situacao:"conferido",conferidoPor:q,conferidoEm:hojeIso(),recebidoEm:d.recebidoEm||hojeIso()}});
    gravarDocs(a,docs,"Documentos conferidos em lote por "+q+(sem?" ("+sem+" sem arquivo registrado ficaram de fora)":""));
    if(sem)aviso(sem+" item(ns) sem arquivo registrado não foram conferidos.");render(true)},
  criarChecklist:()=>{const a=atual();gravar(a.id,{docs:docsDoTipo(a),situacaoDocumentos:a.situacaoDocumentos==="nao_iniciada"?"solicitados":a.situacaoDocumentos},"Checklist de documentos criado ("+(tipoDemandaDe(a)||AREAS[a.area])+")");render(true)},
  posPronta:()=>{const a=atual();if(!a)return;const b=bloqueiosEnc(a);
    if(b.length){aviso("Não é possível marcar como pronta: "+b.join("; ")+".");return}
    gravar(a.id,{posStatus:"pronta"},"Dossiê pronto para encaminhar ao Jurídico");render(true)},
  posEncaminhar:()=>{const a=atual();if(!a)return;const b=bloqueiosEnc(a);
    if(b.length){aviso("Não é possível encaminhar: "+b.join("; ")+".");render(true);return}
    const de=(prompt("Quem está enviando o dossiê?",a.posResponsavel||"")||"").trim();if(!de)return;
    const prov=(prompt("Qual é a primeira providência do Jurídico?",a.posProvidencia||"")||"").trim();if(!prov)return;
    const n=(a.posEncaminhamentos||[]).length+1;
    const reg={n,tipo:n>1?"reenvio":"envio",em:agoraIso(),de,para:a.posRecebe,providencia:prov,resumo:JSON.parse(JSON.stringify(a.posResumo||{}))};
    gravar(a.id,{posStatus:"encaminhada",posProvidencia:prov,posEncaminhamentos:[...(a.posEncaminhamentos||[]),reg]},(n>1?"Dossiê reenviado":"Dossiê encaminhado")+" ao Jurídico. Enviou: "+de+". Recebe: "+a.posRecebe+". Primeira providência: "+prov);
    encaminharAoJuridico(a,a.posRecebe,prov);toast("Dossiê encaminhado: aguardando análise do Jurídico");render(true)},
  enviarJur:()=>ACT.posEncaminhar(),
  devolver:()=>{const a=atual();if(!a)return;
    const m=(prompt("Qual é o motivo da devolução? O Pós-contrato verá esta mensagem.")||"").trim();if(m.length<5){aviso("Informe o motivo da devolução.");return}
    const resp=(prompt("Quem do Pós-contrato resolve?",a.posResponsavel||"")||"").trim();if(!resp){aviso("Informe o responsável.");return}
    const ret=pedirData("Data de retorno (AAAA-MM-DD):",addDias(hojeIso(),3));if(!ret){aviso("Informe a data de retorno no formato AAAA-MM-DD.");return}
    gravar(a.id,{situacaoMinuta:"nao_iniciada",posStatus:"em_revisao",
      posDevolucoes:[...(a.posDevolucoes||[]),{em:agoraIso(),motivo:m,resp,retorno:ret}],
      posPend:[...pendPos(a),{id:uid(),texto:"Devolvido pelo Jurídico: "+m,tipo:"interna",resp,proxima:"Corrigir o dossiê e reenviar ao Jurídico",retorno:ret,essencial:true,situacao:"aberta",criadaEm:agoraIso(),origem:"juridico"}]},
      "Jurídico devolveu o dossiê ao Pós-contrato: "+m+". Responsável: "+resp+". Retorno em "+dataBr(ret)+". Histórico de encaminhamentos preservado.");render(true)},
  dkAdd:()=>{const v=($("#dkNovo")||{}).value.trim();if(!v)return;const tp=ui.dkTipo||todosTipos()[0];const c=cfgDocs[tp]&&cfgDocs[tp].itens?cfgDocs[tp]:docsPadrao(areaDoTipo(tp),tp);salvarCfgDocs(tp,{itens:[...c.itens,{t:v,o:!!$("#dkNovoObr").checked}],confirmado:false})},
  dkRem:b=>{const tp=ui.dkTipo||todosTipos()[0];const c=cfgDocs[tp]&&cfgDocs[tp].itens?cfgDocs[tp]:docsPadrao(areaDoTipo(tp),tp);salvarCfgDocs(tp,{itens:c.itens.filter((_,n)=>n!==Number(b.dataset.n)),confirmado:false})},
  dkConfirmar:()=>{const tp=ui.dkTipo||todosTipos()[0];const c=cfgDocs[tp]&&cfgDocs[tp].itens?cfgDocs[tp]:docsPadrao(areaDoTipo(tp),tp);salvarCfgDocs(tp,{itens:c.itens,confirmado:true});toast("Checklist marcado como definido")}
});
function aplicarSituacao(a,c,v){
  const patch={[c]:v};let log="";
  if(c==="situacaoContratacao"){
    log="Contrato: "+rot(R_CONTR,v);
    if(v==="nao_fechou"){
      const m=(prompt("Por que este atendimento está sendo encerrado sem contratação? O motivo é obrigatório.")||"").trim();
      if(m.length<3){aviso("Encerramento cancelado: informe o motivo.");render(true);return}
      patch.motivoEncerramento=m;log="Encerrado sem contratação. Motivo: "+m;
    }
    if(v==="assinada"){efeitosAssinatura(a,patch);if(a.docs.length===0)log+=". Checklist de documentos criado"}
  }else if(c==="situacaoEntrevista")log="Pré-atendimento: "+rot(R_ENTREV,v);
  else if(c==="situacaoDocumentos")log="Documentos: "+rot(R_DOCS,v);
  else if(c==="triagem")log="Triagem: "+rot(R_TRIAGEM,v);
  gravar(a.id,patch,log||null);render(true);
}
document.addEventListener("click",e=>{
  const g=e.target.closest("[data-go]");
  if(g&&!e.target.closest("[data-act]")){e.preventDefault();go(g.dataset.go);return}
  const b=e.target.closest("[data-act]");
  if(b&&ACT[b.dataset.act]){e.preventDefault();ACT[b.dataset.act](b)}
});
document.addEventListener("change",e=>{
  const t=e.target;if(!t.closest("#view"))return;
  const a=rota.nome==="atendimento"?porId(rota.id):null;
  if(t.dataset.acaosel&&a){ui.acaoSel=ui.acaoSel||{};ui.acaoSel[a.id]=t.value;a.acaoPrev=t.value;gravar(a.id,{acaoPrev:t.value});render(true);return}
  if(t.dataset.kitsel&&a){ui.kitSel=ui.kitSel||{};ui.kitSel[a.id]=t.value;render(true);return}
  if(t.dataset.jf){ui.jf=ui.jf||{};ui.jf[t.dataset.jf]=t.value;render(true);return}
  if(t.dataset.cktipo){ui.ckTipo=t.value;render(true);return}
  if(t.dataset.ckobr!==undefined){const tp=ui.ckTipo||todosTipos()[0];const c=checklistDe(tp);const it=c.itens.map((i,n)=>n===Number(t.dataset.ckobr)?{...i,o:t.checked}:i);salvarCfgCk(tp,{itens:it,confirmado:false});return}
  if(a&&t.dataset.prepsel){const c=t.dataset.prepsel;if(c==="prepTipo"&&t.value&&!a.docs.length){a.prepTipo=t.value;gravar(a.id,{prepTipo:t.value,docs:docsDoTipo(a),situacaoDocumentos:a.situacaoDocumentos==="nao_iniciada"?"solicitados":a.situacaoDocumentos},"Tipo de demanda: "+t.value+". Checklist de documentos criado.");render(true);return}gravar(a.id,{[c]:t.value},(c==="prepTipo"?"Tipo de demanda: ":"Via de atuação: ")+(c==="prepVia"?(VIAS[t.value]||t.value):t.value));render(true);return}
  if(a&&t.dataset.ck){const id=t.dataset.ck;gravar(a.id,{prepChecklist:(a.prepChecklist||[]).map(i=>i.id===id?{...i,feito:t.checked}:i)});render(true);return}
  if(t.dataset.cf){ui[t.dataset.cf==="resp"?"fResp":"fArea"]=t.value;render(true);return}
  if(t.dataset.fech==="mes"){ui.fechMes=t.value;render(true);return}
  if(t.dataset.fech==="pessoa"){ui.fechPessoa=t.value;render(true);return}
  if(a&&t.dataset.posst){if(t.value==="pronta"||t.value==="encaminhada"){const b=bloqueiosEnc(a);if(b.length){aviso("Não é possível avançar: "+b.join("; ")+".");render(true);return}}gravar(a.id,{posStatus:t.value},"Pós-contrato: "+rotPos(t.value));render(true);return}
  if(t.dataset.pf){ui.pf=Object.assign({},ui.pf,{[t.dataset.pf]:t.value});render(true);return}
  if(t.dataset.posresp){const x=porId(t.dataset.posresp);if(x)gravar(x.id,{posResponsavel:t.value.trim()},"Responsável pelo pós-contrato: "+(t.value.trim()||"nenhum"));render(true);return}
  if(t.dataset.ckkind){ui.ckKind=t.value;render(true);return}
  if(t.dataset.dktipo){ui.dkTipo=t.value;render(true);return}
  if(t.dataset.dkobr!==undefined){const tp=ui.dkTipo||todosTipos()[0];const c=cfgDocs[tp]&&cfgDocs[tp].itens?cfgDocs[tp]:docsPadrao(areaDoTipo(tp),tp);salvarCfgDocs(tp,{itens:c.itens.map((i,n)=>n===Number(t.dataset.dkobr)?{...i,o:t.checked}:i),confirmado:false});return}
  if(a&&t.dataset.docf){const d=a.docs.find(x=>x.id===t.dataset.d);if(d&&String(d[t.dataset.docf]||"")!==t.value.trim()){gravar(a.id,{docs:a.docs.map(x=>x.id===d.id?{...x,[t.dataset.docf]:t.value.trim()}:x)},"Documento \""+d.nome+"\": "+(t.dataset.docf==="arquivo"?"arquivo registrado":t.dataset.docf==="recebidoEm"?"recebimento em "+dataBr(t.value):"dúvida técnica registrada")+".");if(t.dataset.docf==="recebidoEm")render(true)}return}
  if(a&&t.dataset.docobr){gravar(a.id,{docs:a.docs.map(x=>x.id===t.dataset.docobr?{...x,obr:t.checked}:x)},"Documento obrigatório: "+(t.checked?"sim":"não"));render(true);return}
  if(a&&t.dataset.resumo){gravar(a.id,{posResumo:{...(a.posResumo||{}),[t.dataset.resumo]:t.value.trim()}},"Resumo do atendimento atualizado: "+((RES_CAMPOS.find(x=>x[0]===t.dataset.resumo)||[])[1]||""));return}
  if(t.id==="maisFiltros"){if(t.value){ui.filtro=t.value;render(true)}return}
  if(!a)return;
  if(t.dataset.chg){
    const c=t.dataset.chg;
    if(c==="origem"){gravar(a.id,{origem:t.value},"Origem: "+(t.value||"não informada"));render(true)}
    else if(c==="area"){gravar(a.id,{area:t.value},"Área: "+AREAS[t.value]);render(true)}
    else aplicarSituacao(a,c,t.value);
  }else if(t.dataset.docsel){mudarDoc(a,t.dataset.docsel,t.value);render(true)}
  else if(t.dataset.tarsel){gravar(a.id,{tarefas:a.tarefas.map(x=>x.id===t.dataset.tarsel?{...x,situacao:t.value}:x)});render(true)}
  else if(t.dataset.resp){gravar(a.id,{ficha:{respostas:{[t.dataset.resp]:t.value}}})}
  else if(t.dataset.multi){const id=t.dataset.multi;const marc=$$(`[data-multi="${id}"]`).filter(x=>x.checked).map(x=>x.value).join(" | ");gravar(a.id,{ficha:{respostas:{[id]:marc}}})}
});
document.addEventListener("focusout",e=>{
  const t=e.target;if(!t.closest||!t.closest("#view"))return;
  const a=rota.nome==="atendimento"?porId(rota.id):null;if(!a)return;
  if(t.dataset.blur){const c=t.dataset.blur;const v=t.value.trim?t.value.trim():t.value;if(String(a[c]||"")!==v){
    const log=c==="fechamentoPor"?"Quem fechou o contrato: "+(v||"sem atribuição")+(a.fechamentoPor?" (antes: "+a.fechamentoPor+")":""):c==="responsavel"?"Responsável comercial: "+(v||"não informado")+(a.responsavel?" (antes: "+a.responsavel+")":""):c==="assinadoEm"?"Data efetiva da assinatura informada: "+dataBr(v):c==="reuniaoEm"?(v?"Reunião marcada para "+fmtR(v):"Reunião desmarcada"):c==="retomarEm"?"Retomar contato em "+dataBr(v):null;
    gravar(a.id,{[c]:v},log);if(c==="reuniaoEm"||c==="retomarEm"||c==="assinadoEm"||c==="fechamentoPor"||c==="fichaLinkManual"||c==="posResponsavel"||c==="posRecebe")setTimeout(()=>render(true),50)}}
  else if(t.dataset.blurcad){const k=t.dataset.blurcad;const v=t.value.trim();
    if(k==="nome"){if(v&&v!==a.nome)gravar(a.id,{nome:v})}
    else if(k==="telefone"){if(v!==a.telefone)gravar(a.id,{telefone:v})}
    else if((a.cadastro[k]||"")!==v)gravar(a.id,{cadastro:{[k]:v}})}
});
document.addEventListener("input",e=>{
  if(e.target.id==="busca"){ui.busca=e.target.value;render(true)}
});

/* ---------- relógio, tema ---------- */
function relogio(){const n=new Date();$("#hora").textContent=n.toLocaleTimeString("pt-BR",{timeZone:TZ,hour:"2-digit",minute:"2-digit",second:"2-digit"});$("#dataext").textContent=n.toLocaleDateString("pt-BR",{timeZone:TZ,weekday:"long",day:"numeric",month:"long"})}
setInterval(relogio,1000);relogio();
$("#tema").onclick=()=>{const r=document.documentElement;const escuro=r.dataset.theme?r.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches;r.dataset.theme=escuro?"light":"dark";try{localStorage.setItem("tema",r.dataset.theme)}catch(e){}};
try{const t=localStorage.getItem("tema");if(t)document.documentElement.dataset.theme=t}catch(e){}

/* ---------- início ---------- */
(()=>{const h=(location.hash||"").replace(/^#/,"");if(h&&h!=="/")go(h);else render(true)})();
(async()=>{
  try{db=await claude.use("db")}catch(e){db=null}
  if(!db){aviso("Entre na sua conta do Claude para ver e salvar os atendimentos.");return}
  col=db.collection("comercial");
  try{db.collection("config").doc("checklists").onSnapshot(d=>{const v=d&&d.data&&d.data();cfgCk=(v&&v.tipos)||{};render(false)},()=>{})}catch(e){}
  try{db.collection("config").doc("checklistsDocs").onSnapshot(d=>{const v=d&&d.data&&d.data();cfgDocs=(v&&v.tipos)||{};render(false)},()=>{})}catch(e){}
  try{db.collection("baixas").onSnapshot(s=>{baixas={};s.docs.forEach(d=>{baixas[d.id]=true});render(false)},()=>{})}catch(e){}
  const t=setTimeout(()=>aviso("Os dados ainda não responderam. A lista pode estar desatualizada."),10000);
  col.onSnapshot(s=>{itens=s.docs.map(d=>norm(d.id,d.data()));carregou=true;if(!s.metadata.fromCache){clearTimeout(t);aviso("")}render(false)},
    e=>{clearTimeout(t);aviso("Não foi possível carregar os atendimentos ("+(e&&e.code||"erro")+").")});
})();
