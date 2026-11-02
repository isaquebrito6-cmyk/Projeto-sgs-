/** Riscos ocupacionais comuns para agilizar o inventário (NR-1) */
import type { TipoRisco } from "@prisma/client";

export type RiscoSugerido = {
  nome: string;
  tipo: TipoRisco;
  fonteGeradora?: string;
};

export const RISCOS_SUGERIDOS: RiscoSugerido[] = [
  { nome: "Ruído", tipo: "FISICO", fonteGeradora: "Máquinas, ferramentas, ambiente" },
  { nome: "Vibração de corpo inteiro / mãos e braços", tipo: "FISICO", fonteGeradora: "Equipamentos motorizados" },
  { nome: "Calor / exposição térmica", tipo: "FISICO", fonteGeradora: "Processos, fornos, ambiente externo" },
  { nome: "Frio", tipo: "FISICO", fonteGeradora: "Câmaras frias, ambiente externo" },
  { nome: "Radiação não ionizante", tipo: "FISICO", fonteGeradora: "Solda, UV, laser" },
  { nome: "Iluminação inadequada", tipo: "FISICO", fonteGeradora: "Ambiente de trabalho" },
  { nome: "Poeira / aerodispersoides", tipo: "QUIMICO", fonteGeradora: "Processos, material particulado" },
  { nome: "Fumos metálicos", tipo: "QUIMICO", fonteGeradora: "Solda, corte" },
  { nome: "Vapores de solventes", tipo: "QUIMICO", fonteGeradora: "Tintas, adesivos, limpeza" },
  { nome: "Produtos químicos / irritantes", tipo: "QUIMICO", fonteGeradora: "Manipulação de substâncias" },
  { nome: "Agentes biológicos", tipo: "BIOLOGICO", fonteGeradora: "Contato com materiais biológicos / efluentes" },
  { nome: "Postura inadequada / esforço repetitivo", tipo: "ERGONOMICO", fonteGeradora: "Posto de trabalho, ritmo" },
  { nome: "Levantamento e transporte manual de cargas", tipo: "ERGONOMICO", fonteGeradora: "Movimentação de materiais" },
  { nome: "Organização do trabalho / sobrecarga", tipo: "PSICOSSOCIAL", fonteGeradora: "Jornada, metas, pressão temporal" },
  { nome: "Assédio / violência no trabalho", tipo: "PSICOSSOCIAL", fonteGeradora: "Relações interpessoais / organização" },
  { nome: "Queda de mesmo nível", tipo: "ACIDENTE", fonteGeradora: "Piso, obstáculos, desorganização" },
  { nome: "Queda de altura", tipo: "ACIDENTE", fonteGeradora: "Trabalho acima de 2 m, aberturas" },
  { nome: "Choque elétrico", tipo: "ACIDENTE", fonteGeradora: "Instalações e serviços com eletricidade" },
  { nome: "Máquinas e equipamentos (partes móveis)", tipo: "ACIDENTE", fonteGeradora: "Operação / manutenção" },
  { nome: "Veículos / empilhadeira / atropelamento", tipo: "ACIDENTE", fonteGeradora: "Circulação interna" },
  { nome: "Espaço confinado", tipo: "ACIDENTE", fonteGeradora: "Tanques, silos, fossas, tubulações" },
  { nome: "Incêndio / explosão", tipo: "ACIDENTE", fonteGeradora: "Inflamáveis, combustíveis, processos" },
];
