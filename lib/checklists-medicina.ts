/** Checklists para envio à clínica e emissão de ASO (NR-7 / avaliação psicossocial) */

export type ChecklistItem = {
  id: string;
  pergunta: string;
  tipo: "sim_nao" | "texto";
};

/** Anamnese ocupacional — preenchimento pelo trabalhador / entrevista clínica */
export const CHECKLIST_ANAMNESE: ChecklistItem[] = [
  { id: "a1", pergunta: "Possui alguma doença crônica diagnosticada?", tipo: "sim_nao" },
  { id: "a2", pergunta: "Faz uso contínuo de medicamentos? Quais?", tipo: "texto" },
  { id: "a3", pergunta: "Já sofreu acidente de trabalho ou doença ocupacional?", tipo: "sim_nao" },
  { id: "a4", pergunta: "Possui restrição médica conhecida para a função?", tipo: "sim_nao" },
  { id: "a5", pergunta: "Tem alergia a medicamentos, alimentos ou substâncias químicas?", tipo: "texto" },
  { id: "a6", pergunta: "Realizou cirurgia nos últimos 12 meses?", tipo: "sim_nao" },
  { id: "a7", pergunta: "Apresenta dor frequente (coluna, articulações, cabeça)?", tipo: "sim_nao" },
  { id: "a8", pergunta: "Tem problemas de visão, audição ou equilíbrio?", tipo: "sim_nao" },
  { id: "a9", pergunta: "Fuma ou fez uso de tabaco nos últimos 12 meses?", tipo: "sim_nao" },
  { id: "a10", pergunta: "Consome bebida alcoólica com frequência?", tipo: "sim_nao" },
  { id: "a11", pergunta: "Pratica atividade física regularmente?", tipo: "sim_nao" },
  { id: "a12", pergunta: "Observações / queixas atuais do trabalhador", tipo: "texto" },
];

/** Avaliação psicossocial / comportamental (apoio à NR-1 e saúde mental no trabalho) */
export const CHECKLIST_PSICOSSOCIAL: ChecklistItem[] = [
  { id: "p1", pergunta: "Sente sobrecarga excessiva de trabalho na função atual?", tipo: "sim_nao" },
  { id: "p2", pergunta: "Tem dificuldade para conciliar trabalho e vida pessoal?", tipo: "sim_nao" },
  { id: "p3", pergunta: "Sente-se inseguro(a) no ambiente de trabalho?", tipo: "sim_nao" },
  { id: "p4", pergunta: "Já sofreu ou presenciou assédio moral ou sexual no trabalho?", tipo: "sim_nao" },
  { id: "p5", pergunta: "Tem dificuldade de relacionamento com colegas ou chefia?", tipo: "sim_nao" },
  { id: "p6", pergunta: "Apresenta sintomas de ansiedade, irritabilidade ou tristeza persistente?", tipo: "sim_nao" },
  { id: "p7", pergunta: "Tem problemas de sono relacionados ao trabalho?", tipo: "sim_nao" },
  { id: "p8", pergunta: "Já pensou em se afastar por motivos de saúde mental?", tipo: "sim_nao" },
  { id: "p9", pergunta: "Sente apoio da empresa em relação à saúde e segurança?", tipo: "sim_nao" },
  { id: "p10", pergunta: "Observações do trabalhador ou do profissional de saúde", tipo: "texto" },
];

export type ChecklistRespostas = Record<string, string>;

export type ChecklistsMedicinaPayload = {
  anamnese: ChecklistRespostas;
  psicossocial: ChecklistRespostas;
};

export function serializarChecklists(data: ChecklistsMedicinaPayload): string {
  return JSON.stringify(data);
}

export function parseChecklists(raw: string | null | undefined): ChecklistsMedicinaPayload | null {
  if (!raw?.trim()) return null;
  try {
    const o = JSON.parse(raw);
    if (o && typeof o === "object") {
      return {
        anamnese: o.anamnese || {},
        psicossocial: o.psicossocial || {},
      };
    }
  } catch {
    // texto livre antigo
    return {
      anamnese: {},
      psicossocial: { legado: raw },
    };
  }
  return null;
}

export function labelResposta(v: string | undefined) {
  if (!v) return "—";
  if (v === "sim") return "Sim";
  if (v === "nao") return "Não";
  return v;
}
