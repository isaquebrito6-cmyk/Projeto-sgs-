/**
 * Catálogo de capacitações alinhado às Normas Regulamentadoras (MTE).
 * Inclui NRs gerais e capacitações de operadores (empilhadeira, PTA, máquinas).
 * Valores orientativos — validar sempre com o texto vigente da norma.
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
  // ——— NR-01 ———
  {
    id: "nr01-integracao",
    norma: "NR-01",
    titulo: "NR-01 — Integração / informações de SST na admissão",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: null,
    validadeMeses: null,
    modalidade: "CONFORME_NR",
    conteudoProgramatico:
      "Direitos e deveres do trabalhador e do empregador; riscos da função e do ambiente; medidas de prevenção; procedimentos de emergência; canais de comunicação; fatores de risco psicossociais (GRO/PGR quando aplicável).",
    observacao: "NR-1 itens 1.4.4 e 1.7 — carga conforme riscos e NR específica da função.",
  },
  {
    id: "nr01-assedio",
    norma: "NR-01",
    titulo: "NR-01 — Capacitação sobre assédio e violência no trabalho",
    tipoCapacitacao: "PERIODICO",
    cargaHorariaMin: null,
    validadeMeses: 12,
    modalidade: "CONFORME_NR",
    conteudoProgramatico:
      "Conceitos de assédio moral e sexual e violência no trabalho; prevenção; canais de denúncia; papel da organização e da CIPA; conduta esperada.",
    observacao: "Periodicidade anual quando houver CIPA (NR-1).",
  },

  // ——— NR-05 ———
  {
    id: "nr05-cipa",
    norma: "NR-05",
    titulo: "NR-05 — Treinamento de CIPA (membros e representante nomeado)",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 8,
    validadeMeses: 24,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Estudo do ambiente e processo de trabalho; metodologia de investigação de acidentes; noções sobre doenças do trabalho; princípios gerais de higiene e segurança; legislação trabalhista e previdenciária; organização da CIPA; prevenção e combate a incêndios; primeiros socorros.",
    observacao: "Carga conforme grau de risco: 8h (GR1), 12h (GR2), 16h (GR3), 20h (GR4). Ajuste no cadastro.",
  },

  // ——— NR-06 ———
  {
    id: "nr06-epi",
    norma: "NR-06",
    titulo: "NR-06 — Orientação e treinamento de EPI",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: null,
    validadeMeses: 12,
    modalidade: "CONFORME_NR",
    conteudoProgramatico:
      "Obrigatoriedade e responsabilidade no uso do EPI; uso correto; guarda e conservação; higienização; limitação de uso; inspeção; comunicação de irregularidades; CA e validade do equipamento.",
    observacao: "NR-6 não fixa carga/validade; treinar na admissão, troca de EPI/função e periodicamente.",
  },

  // ——— NR-10 ———
  {
    id: "nr10-basico",
    norma: "NR-10",
    titulo: "NR-10 — Básico (segurança em instalações e serviços com eletricidade)",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 40,
    validadeMeses: 24,
    modalidade: "CONFORME_NR",
    conteudoProgramatico:
      "Introdução à segurança com eletricidade; riscos em instalações e serviços; análise de risco; medidas de controle; normas técnicas; EPC e EPI; rotinas e procedimentos; documentações; riscos adicionais; combate a incêndio; acidentes elétricos; primeiros socorros; responsabilidades.",
    observacao: "Reciclagem bienal. A partir de 01/06/2027: reciclagem mín. 16h e prática presencial.",
  },
  {
    id: "nr10-sep",
    norma: "NR-10",
    titulo: "NR-10 — Complementar SEP (Sistema Elétrico de Potência)",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 40,
    validadeMeses: 24,
    modalidade: "CONFORME_NR",
    conteudoProgramatico:
      "Organização do SEP; riscos típicos; análise de risco; procedimentos e PT; desenergização; proteção coletiva e individual; métodos de trabalho; arco elétrico; indução; descargas atmosféricas; resgate; acidentes típicos do SEP.",
    observacao: "Para autorizados que atuam no SEP ou em sua proximidade.",
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
      "Atualização conforme realidade do trabalho; revisão de riscos elétricos; procedimentos; EPI/EPC; análise de incidentes; mudanças em instalações ou métodos.",
    observacao: "Bienal; também em troca de função/empresa, afastamento > 3 meses ou mudanças significativas.",
  },

  // ——— NR-11 (transporte / empilhadeira / carrinho) ———
  {
    id: "nr11-empilhadeira",
    norma: "NR-11",
    titulo: "NR-11 — Operador de empilhadeira",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 8,
    validadeMeses: 12,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Treinamento específico que habilita na função; tipos de empilhadeira; inspeção diária; estabilidade e centro de gravidade; operação com carga; circulação e sinalização; riscos de tombamento e atropelamento; abastecimento/carregamento de bateria; cartão de identificação com foto.",
    observacao: "NR-11: cartão de identificação com validade de 1 ano; revalidação exige exame de saúde. Carga horária do curso definida pela empresa (sugestão prática 8–16h).",
  },
  {
    id: "nr11-carrinho",
    norma: "NR-11",
    titulo: "NR-11 — Operador de carrinho industrial / paleteira",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 4,
    validadeMeses: 12,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Operação segura de carrinho industrial e paleteira (manual ou elétrica); inspeção; capacidade de carga; circulação em corredores; riscos de atropelamento e esmagamento; sinalização; práticas de armazenagem.",
    observacao: "Capacitação específica da empresa (NR-11). Cartão de identificação quando for equipamento de transporte motorizado.",
  },
  {
    id: "nr11-transporte",
    norma: "NR-11",
    titulo: "NR-11 — Operador de equipamento de transporte motorizado (geral)",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: null,
    validadeMeses: 12,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Treinamento específico dado pela empresa; operação segura; inspeção; riscos de tombamento e atropelamento; sinalização; carga e estabilidade; cartão de identificação com nome e fotografia.",
    observacao: "Item 11.1.5 e 11.1.6 — cartão válido por 1 ano com exame de saúde para revalidação.",
  },

  // ——— NR-12 (máquinas) ———
  {
    id: "nr12-maquinas",
    norma: "NR-12",
    titulo: "NR-12 — Operador de máquinas em geral",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: null,
    validadeMeses: null,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Conteúdo conforme Anexo II da NR-12 e tipo de máquina; identificação dos riscos; dispositivos de segurança; procedimentos de trabalho; inspeção; manutenção básica permitida; situações de emergência; proibições de operação.",
    observacao: "Carga definida pelo empregador (12.16.3). Reciclagem quando houver mudanças significativas nas máquinas ou métodos.",
  },
  {
    id: "nr12-pta",
    norma: "NR-12 / NR-18",
    titulo: "Operador de PTA / plataforma elevatória (PEMT)",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 4,
    validadeMeses: 24,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Tipos de plataforma elevatória de trabalho (tesoura, articulado, telescópico); inspeção pré-uso; estabilização e nivelamento; limites de carga e alcance; riscos de tombamento e queda; zona de trabalho e isolamento; operação próxima a redes elétricas; procedimentos de emergência e resgate; uso de EPI e cinturão quando exigido.",
    observacao: "NR-18 (PEMT): inicial 4h e periódico 4h/2 anos. Integrar com NR-12 e NR-35 quando houver trabalho em altura.",
  },
  {
    id: "nr12-autopropelidas",
    norma: "NR-12",
    titulo: "NR-12 — Operador de máquinas autopropelidas",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: null,
    validadeMeses: 12,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Capacitação específica da máquina; riscos de operação; dispositivos de segurança; inspeção; cartão de identificação com foto (item 12.16.10); renovação anual mediante exame médico.",
    observacao: "Cartão de identificação renovado no máximo a cada 1 ano (NR-12 item 12.16.10).",
  },

  // ——— NR-18 (construção) ———
  {
    id: "nr18-basico",
    norma: "NR-18",
    titulo: "NR-18 — Básico em segurança do trabalho na construção",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 4,
    validadeMeses: 24,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Condições e meio ambiente de trabalho na construção; riscos nas fases da obra; proteção coletiva e individual; ordem e limpeza; áreas de vivência; prevenção de quedas e soterramento; procedimentos de emergência.",
    observacao: "Periódico: 4h a cada 2 anos.",
  },
  {
    id: "nr18-pta",
    norma: "NR-18",
    titulo: "NR-18 — Operador de PEMT / plataforma elevatória (construção)",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 4,
    validadeMeses: 24,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Operação de plataformas elevatórias móveis de trabalho na construção; inspeção; estabilização; riscos específicos de canteiro; convivência com outras frentes de serviço; EPI; emergência.",
    observacao: "Quadro de capacitação da NR-18: 4h inicial e 4h a cada 2 anos.",
  },
  {
    id: "nr18-andaimes",
    norma: "NR-18",
    titulo: "NR-18 — Montagem e uso de andaimes",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: null,
    validadeMeses: null,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Tipos de andaimes; montagem, uso e desmontagem segura; ancoragem; carga permitida; inspeção; EPI e proteção coletiva; proibições; condições impeditivas.",
    observacao: "Carga a critério do empregador conforme complexidade e NR-18.",
  },

  // ——— NR-20 ———
  {
    id: "nr20-basico",
    norma: "NR-20",
    titulo: "NR-20 — Segurança com inflamáveis e combustíveis (básico)",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 4,
    validadeMeses: 36,
    modalidade: "CONFORME_NR",
    conteudoProgramatico:
      "Inflamáveis e combustíveis; classes de instalação; riscos de incêndio e explosão; medidas de prevenção; procedimentos básicos; EPI; resposta a emergências.",
    observacao: "Carga e periodicidade variam por nível (básico a avançado II) e classe da instalação.",
  },
  {
    id: "nr20-intermediario",
    norma: "NR-20",
    titulo: "NR-20 — Intermediário (inflamáveis e combustíveis)",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 12,
    validadeMeses: 24,
    modalidade: "CONFORME_NR",
    conteudoProgramatico:
      "Conteúdo do básico ampliado; procedimentos operacionais; análise de risco; permissas de trabalho; sistemas de proteção; cenários de emergência da instalação.",
    observacao: "Ajuste carga conforme classe I/II/III da NR-20.",
  },

  // ——— NR-33 ———
  {
    id: "nr33-autorizado",
    norma: "NR-33",
    titulo: "NR-33 — Trabalhador autorizado e vigia (espaço confinado)",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 16,
    validadeMeses: 12,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Definições e reconhecimento de espaço confinado; avaliação de riscos; Permissão de Entrada e Trabalho (PET); uso de equipamentos; procedimentos de entrada, trabalho e saída; atuação do vigia; emergências e abandono; noções de resgate.",
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
      "Conteúdo do autorizado/vigia ampliado; gestão da PET; análise de risco; atmosfera e ventilação; equipe e comunicação; planos de emergência e resgate; responsabilidades do supervisor.",
    observacao: "Periódico anual de 8h.",
  },
  {
    id: "nr33-periodico",
    norma: "NR-33",
    titulo: "NR-33 — Periódico (autorizado, vigia ou supervisor)",
    tipoCapacitacao: "PERIODICO",
    cargaHorariaMin: 8,
    validadeMeses: 12,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Atualização de riscos em espaços confinados; PET; procedimentos; equipamentos; exercícios de emergência; lições de incidentes.",
    observacao: "Anual para autorizado, vigia e supervisor.",
  },

  // ——— NR-35 ———
  {
    id: "nr35-altura",
    norma: "NR-35",
    titulo: "NR-35 — Trabalho em altura",
    tipoCapacitacao: "INICIAL",
    cargaHorariaMin: 8,
    validadeMeses: 24,
    modalidade: "PRESENCIAL",
    conteudoProgramatico:
      "Normas aplicáveis; análise de risco e condições impeditivas; riscos e medidas de prevenção; proteção coletiva; EPI para altura; sistemas de ancoragem; emergência e salvamento.",
    observacao: "Periódico 8h a cada 2 anos. Modalidade presencial obrigatória.",
  },

  // ——— DDS / Brigada ———
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
    observacao: "Boa prática de SST / apoio à CIPA e ao GRO (NR-1).",
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
      "Prevenção e combate a princípio de incêndio; classes de fogo; uso de extintores; rotas de fuga; pontos de encontro; evacuação; primeiros procedimentos de emergência.",
    observacao: "Complementar às exigências do Corpo de Bombeiros e do plano de emergência.",
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
