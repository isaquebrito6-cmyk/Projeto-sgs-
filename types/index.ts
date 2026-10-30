import { Role, TipoRisco, NivelRisco, StatusDocumento, StatusSolicitacao } from "@prisma/client";

export type { Role, TipoRisco, NivelRisco, StatusDocumento, StatusSolicitacao };

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  EMPRESA: "Empresa",
  CLINICA: "Clínica",
  MEDICO: "Médico",
};

export const TIPO_RISCO_LABELS: Record<TipoRisco, string> = {
  FISICO: "Físico",
  QUIMICO: "Químico",
  BIOLOGICO: "Biológico",
  ERGONOMICO: "Ergonômico",
  ACIDENTE: "Acidente",
  PSICOSSOCIAL: "Psicossocial",
};

export const NIVEL_RISCO_LABELS: Record<NivelRisco, string> = {
  BAIXO: "Baixo",
  MEDIO: "Médio",
  ALTO: "Alto",
  MUITO_ALTO: "Muito Alto",
};

export const STATUS_DOCUMENTO_LABELS: Record<StatusDocumento, string> = {
  RASCUNHO: "Rascunho",
  EM_REVISAO: "Em revisão",
  APROVADO: "Aprovado",
  VENCIDO: "Vencido",
};

export const STATUS_SOLICITACAO_LABELS: Record<StatusSolicitacao, string> = {
  PENDENTE: "Pendente",
  ENVIADA_CLINICA: "Enviada à clínica",
  EM_ATENDIMENTO: "Em atendimento",
  ASO_EMITIDO: "ASO emitido",
  CANCELADA: "Cancelada",
};

export const TIPOS_EXAME = [
  "Admissional",
  "Periódico",
  "Retorno ao Trabalho",
  "Mudança de Riscos Ocupacionais",
  "Demissional",
] as const;

export type TipoExame = (typeof TIPOS_EXAME)[number];
