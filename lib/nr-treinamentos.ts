/**
 * Catálogo de capacitações alinhado às Normas Regulamentadoras (MTE).
 * Fontes: NR-1 (certificado e regras gerais), NR-5, NR-6, NR-10, NR-11,
 * NR-12, NR-18, NR-20, NR-33, NR-35 e DDS (boa prática / CIPA).
 * Valores orientativos — a empresa deve validar com o texto vigente da norma.
 */

export type ModalidadeNR = "PRESENCIAL" | "EAD_OU_SEMI" | "CONFORME_NR";

export type TipoCapacitacao = "INICIAL" | "PERIODICO" | "EVENTUAL" | "DDS";

export type CatalogoTreinamento = {
  id: string;
  norma: string;
  titulo: string;
  tipoCapacitacao: TipoCapacitacao;
  cargaHorariaMin: number | null;
  /** meses até reciclagem; null = definida pelo empregador / eventual */
  validadeMeses: number | null;
  modalidade: ModalidadeNR;
  conteudoProgramatico: string;
  observacao?: string;
};

export const CATALOGO_TREINAMENTOS: CatalogoTreinamento[] = [
  {
    id: "dds",
    norma: "DDS",
    titulo: "Diálogo Diário de Segurança (DDS)",
    tipoCapacitacao: "DDS",
    cargaHorariaMin: null,
    validadeMeses: null,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Tema do dia; riscos da atividade; medidas preventivas; uso de EPI; participação dos trabalhadores; registro de presença.",
    observacao: "Boa prática de SST / apoio à CIPA e ao GRO (NR-1). Sem carga fixa na norma.",
  },
  {
    id: "nr01-integracao",
    norma: "NR-01",
    titulo: "Integração / informações de SST na admissão (NR-01)",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: null,
    validadeMeses: null,
    modalidade: "CONFORME_NR",
    conteudoProgramatico:
      "Direitos e deveres do trabalhador e do empregador; riscos da função e do ambiente; medidas de prevenção; procedimentos de emergência; canais de comunicação; fatores de risco psicossociais (quando aplicável ao GRO/PGR).",
    observacao: "NR-1 item 1.4.4 e 1.7 — carga conforme riscos e NR específica.",
  },
  {
    id: "nr01-assedio",
    norma: "NR-01",
    titulo: "Capacitação sobre assédio e violência (NR-01 / CIPA)",
    tipoCapacitacao: "PERIODICO",
    cargaHorariaMin: null,
    validadeMeses: 12,
    modalidade: "CONFORME_NR",
    conteudoProgramatico:
      "Conceitos de assédio moral e sexual e violência no trabalho; prevenção; canais de denúncia; papel da organização e da CIPA; conduta esperada.",
    observacao: "Periodicidade anual quando houver CIPA (NR-1).",
  },
  {
    id: "nr05-cipa",
    norma: "NR-05",
    titulo: "Treinamento de CIPA (membros e representante nomeado)",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 8,
    validadeMeses: 24,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Estudo do ambiente e processo de trabalho; metodologia de investigação de acidentes; noções sobre doenças do trabalho; princípios gerais de higiene e segurança; legislação trabalhista e previdenciária; organização da CIPA; prevenção e combate a incêndios; primeiros socorros (conforme grau de risco e carga da NR-5).",
    observacao: "Carga: 8h (GR1), 12h (GR2), 16h (GR3), 20h (GR4). Ajuste a carga conforme grau de risco da empresa.",
  },
  {
    id: "nr06-epi",
    norma: "NR-06",
    titulo: "Orientação e treinamento de EPI (NR-06)",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: null,
    validadeMeses: 12,
    modalidade: "CONFORME_NR",
    conteudoProgramatico:
      "Obrigatoriedade e responsabilidade no uso do EPI; uso correto; guarda e conservação; higienização; limitação de uso; inspeção; comunicação de irregularidades; CA e validade do equipamento.",
    observacao: "NR-6 não fixa carga/validade; renovar na admissão, troca de EPI/função e periodicamente a critério do empregador.",
  },
  {
    id: "nr10-basico",
    norma: "NR-10",
    titulo: "NR-10 Básico — Segurança em instalações e serviços com eletricidade",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 40,
    validadeMeses: 24,
    modalidade: "CONFORME_NR",
    conteudoProgramatico:
      "Introdução à segurança com eletricidade; riscos em instalações e serviços; técnicas de análise de risco; medidas de controle do risco elétrico; normas técnicas e regulamentações; EPC e EPI; rotinas e procedimentos de trabalho; documentações; riscos adicionais; proteção e combate a incêndio; acidentes de origem elétrica; primeiros socorros; responsabilidades.",
    observacao: "Reciclagem bienal. A partir de 01/06/2027: reciclagem mín. 16h e prática presencial (Portaria MTE 737/2026).",
  },
  {
    id: "nr10-sep",
    norma: "NR-10",
    titulo: "NR-10 Complementar — Sistema Elétrico de Potência (SEP)",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 40,
    validadeMeses: 24,
    modalidade: "CONFORME_NR",
    conteudoProgramatico:
      "Organização do SEP; riscos típicos; análise de risco; procedimentos de trabalho e PT; desenergização; proteção coletiva e individual; métodos de trabalho; arco elétrico; indução; descargas atmosféricas; campos elétricos e magnéticos; resgate; acidentes típicos do SEP.",
    observacao: "Para autorizados que atuam no SEP ou em sua proximidade. Reciclagem bienal.",
  },
  {
    id: "nr10-reciclagem",
    norma: "NR-10",
    titulo: "NR-10 — Reciclagem / periódico",
    tipoCapacitacao: "PERIODICO",
    cargaHorariaMin: 16,
    validadeMeses: 24,
    modalidade: "CONFORME_NR",
    conteudoProgramatico:
      "Atualização conforme realidade do trabalho; revisão de riscos elétricos; procedimentos; EPI/EPC; análise de incidentes; mudanças em instalações ou métodos; primeiros socorros aplicados.",
    observacao: "Bienal; também em troca de função/empresa, afastamento > 3 meses ou mudanças significativas.",
  },
  {
    id: "nr11-empilhadeira",
    norma: "NR-11",
    titulo: "NR-11 — Operador de equipamento de transporte motorizado",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: null,
    validadeMeses: 12,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Treinamento específico dado pela empresa que habilita na função; operação segura; inspeção do equipamento; riscos de tombamento e atropelamento; sinalização; carga e estabilidade; cartão de identificação com foto.",
    observacao: "A NR-11 não fixa horas do curso; o cartão de identificação tem validade de 1 ano e exige exame de saúde para revalidação.",
  },
  {
    id: "nr12-maquinas",
    norma: "NR-12",
    titulo: "NR-12 — Capacitação para operação de máquinas e equipamentos",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: null,
    validadeMeses: null,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Conteúdo programático conforme Anexo II da NR-12 e tipo de máquina; descrição e identificação dos riscos; dispositivos de segurança; procedimentos de trabalho e segurança; inspeção; manutenção básica permitida; situações de emergência.",
    observacao: "Carga definida pelo empregador (item 12.16.3). Reciclagem quando houver mudanças significativas (não é só calendário).",
  },
  {
    id: "nr18-basico",
    norma: "NR-18",
    titulo: "NR-18 — Básico em segurança do trabalho na construção",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 4,
    validadeMeses: 24,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Condições e meio ambiente de trabalho na construção; riscos nas fases da obra; medidas de proteção coletiva e individual; ordem e limpeza; áreas de vivência; prevenção de quedas e soterramento; procedimentos de emergência (conforme Anexo de capacitação da NR-18).",
    observacao: "Periódico: 4h a cada 2 anos.",
  },
  {
    id: "nr20-basico",
    norma: "NR-20",
    titulo: "NR-20 — Segurança com inflamáveis e combustíveis (básico)",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 4,
    validadeMeses: 36,
    modalidade: "CONFORME_NR",
    conteudoProgramatico:
      "Inflamáveis e combustíveis; classes de instalação; riscos de incêndio e explosão; medidas de prevenção; procedimentos básicos; EPI; resposta a emergências conforme classe e curso da NR-20.",
    observacao: "Carga e periodicidade variam por nível (básico a avançado II). Ajuste conforme classe da instalação.",
  },
  {
    id: "nr33-autorizado",
    norma: "NR-33",
    titulo: "NR-33 — Espaço confinado (trabalhador autorizado e vigia)",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 16,
    validadeMeses: 12,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Definições e reconhecimento de espaço confinado; avaliação de riscos; Permissão de Entrada e Trabalho (PET); uso de equipamentos; procedimentos de entrada, trabalho e saída; atuação do vigia; emergências e abandono; noções de resgate (conforme Anexo de capacitação).",
    observacao: "Periódico anual de 8h. Metade da carga inicial em prática, conforme norma.",
  },
  {
    id: "nr33-supervisor",
    norma: "NR-33",
    titulo: "NR-33 — Supervisor de entrada em espaço confinado",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 40,
    validadeMeses: 12,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Conteúdo do trabalhador autorizado/vigia ampliado; gestão da PET; análise de risco; atmosfera e ventilação; equipe e comunicação; planos de emergência e resgate; responsabilidades do supervisor.",
    observacao: "Periódico anual de 8h.",
  },
  {
    id: "nr35-altura",
    norma: "NR-35",
    titulo: "NR-35 — Trabalho em altura",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 8,
    validadeMeses: 24,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Normas e regulamentos aplicáveis; análise de risco e condições impeditivas; riscos potenciais e medidas de prevenção; proteção coletiva; EPI para altura (seleção, inspeção, conservação e limitação); sistemas de ancoragem; procedimentos de emergência e salvamento; conduta em caso de acidente.",
    observacao: "Periódico: 8h a cada 2 anos. Modalidade presencial (item 35.4.5 / Portaria MTE 1.259/2026).",
  },
  {
    id: "brigada",
    norma: "Brigada",
    titulo: "Brigada de emergência / combate a incêndio",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 4,
    validadeMeses: 12,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Prevenção e combate a princípio de incêndio; classes de fogo; uso de extintores; rotas de fuga; pontos de encontro; evacuação; primeiros procedimentos de emergência; integração com plano de emergência da empresa.",
    observacao: "Complementar às exigências do Corpo de Bombeiros estadual e do plano de emergência (NR-1/NR-23 quando aplicável).",
  },
];

export function getCatalogoById(id: string) {
  return CATALOGO_TREINAMENTOS.find((c) => c.id === id);
}

export function calcularValidade(
  dataRealizacao: Date,
  validadeMeses: number | null
): Date | null {
  if (!validadeMeses) return null;
  const d = new Date(dataRealizacao);
  d.setMonth(d.getMonth() + validadeMeses);
  return d;
}

export function formatValidadeLabel(meses: number | null) {
  if (meses == null) return "Conforme empregador / eventual";
  if (meses === 12) return "12 meses (anual)";
  if (meses === 24) return "24 meses (bienal)";
  if (meses === 36) return "36 meses (trienal)";
  return `${meses} meses`;
}
