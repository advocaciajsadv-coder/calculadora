/// Espelha `backend/app/modules/folder_organizer/structure.py`: a estrutura
/// fixa de pastas de cada cliente, usada para montar a árvore estilo
/// Explorador de Arquivos do Windows e o menu de "mover para" no drag-and-drop.
const Map<String, List<String>> clientFolderStructure = {
  '01 - Documentos Pessoais': ['Identificação', 'Endereço', 'Certidões', 'Outros'],
  '02 - Provas': ['Fotos', 'Conversas', 'Áudios e Vídeos', 'Documentos'],
  '03 - Petições': ['Iniciais', 'Manifestações', 'Recursos', 'Decisões'],
  '04 - Documentos Assinados': ['Contratos', 'Procurações', 'Declarações', 'ZapSign'],
  '05 - Documentos do Caso': ['Trabalhista', 'Previdenciário', 'Médico', 'Financeiro'],
  '06 - Arquivos Recebidos': [],
  '07 - Arquivos Enviados': [],
  '99 - Não Identificados': [],
};
