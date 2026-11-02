/**
 * Montagem de textos do PGR alinhados à NR-1 (GRO/PGR) — MTE.
 * Conteúdo mínimo do inventário: 1.5.7.3.2
 */

export type EmpresaPGRSnapshot = {
  razaoSocial: string;
  nomeFantasia?: string | null;
  cnpj?: string | null;
  cnae?: string | null;
  grauRisco?: number | null;
  numeroFuncionarios?: number | null;
  endereco?: string | null;
  cidade?: string | null;
  uf?: string | null;
  setores: {
    nome: string;
    descricao?: string | null;
    nColaboradores: number;
    funcoes: string[];
    ghes: { nome: string; descricao?: string | null }[];
  }[];
};

export function labelGrauRisco(gr?: number | null) {
  if (gr == null) return "não informado";
  const map: Record<number, string> = {
    1: "1 — atividades com menor potencial de risco (NR-4)",
    2: "2 — potencial intermediário (NR-4)",
    3: "3 — potencial elevado (NR-4)",
    4: "4 — potencial máximo (NR-4)",
  };
  return map[gr] || String(gr);
}

/** Caracterização dos processos e ambientes (inventário NR-1) */
export function montarCaracterizacaoProcessos(emp: EmpresaPGRSnapshot): string {
  const linhas: string[] = [];

  linhas.push("1. IDENTIFICAÇÃO DA ORGANIZAÇÃO");
  linhas.push(`Razão social: ${emp.razaoSocial}`);
  if (emp.nomeFantasia) linhas.push(`Nome fantasia: ${emp.nomeFantasia}`);
  if (emp.cnpj) linhas.push(`CNPJ: ${emp.cnpj}`);
  if (emp.cnae) linhas.push(`CNAE: ${emp.cnae}`);
  linhas.push(`Grau de risco (NR-4): ${labelGrauRisco(emp.grauRisco)}`);
  if (emp.numeroFuncionarios != null) {
    linhas.push(`Nº de trabalhadores informado: ${emp.numeroFuncionarios}`);
  }
  const end = [emp.endereco, emp.cidade, emp.uf].filter(Boolean).join(", ");
  if (end) linhas.push(`Endereço / estabelecimento: ${end}`);

  linhas.push("");
  linhas.push("2. PROCESSOS, SETORES E AMBIENTES DE TRABALHO");
  if (!emp.setores.length) {
    linhas.push(
      "Nenhum setor cadastrado ainda. Cadastre setores, funções e GHEs na empresa para enriquecer o inventário."
    );
  } else {
    for (const s of emp.setores) {
      linhas.push(`• Setor: ${s.nome}${s.descricao ? ` — ${s.descricao}` : ""}`);
      linhas.push(`  Colaboradores ativos no setor: ${s.nColaboradores}`);
      if (s.funcoes.length) {
        linhas.push(`  Funções: ${s.funcoes.join("; ")}`);
      } else {
        linhas.push("  Funções: não cadastradas");
      }
      if (s.ghes.length) {
        linhas.push(
          `  GHE (Grupos Homogêneos de Exposição): ${s.ghes
            .map((g) => (g.descricao ? `${g.nome} (${g.descricao})` : g.nome))
            .join("; ")}`
        );
      } else {
        linhas.push("  GHE: não cadastrado neste setor");
      }
    }
  }

  linhas.push("");
  linhas.push("3. OBSERVAÇÃO");
  linhas.push(
    "A caracterização acima consolida dados cadastrais da empresa, setores, funções e GHEs para o inventário de riscos ocupacionais do PGR (NR-1, itens 1.5.7.1 e 1.5.7.3). Deve ser revisada sempre que houver mudança de processo, layout ou quadro de pessoal."
  );

  return linhas.join("\n");
}

export function metodologiaAvaliacaoPadraoNR1(): string {
  return [
    "Metodologia alinhada ao Gerenciamento de Riscos Ocupacionais (GRO) da NR-1:",
    "• Identificação de perigos e fatores de risco (físicos, químicos, biológicos, ergonômicos — inclusive psicossociais —, e de acidentes);",
    "• Avaliação qualitativa com probabilidade (1 a 5) e severidade (1 a 5); nível de risco = P × S;",
    "  – Baixo: ≤ 4; Médio: ≤ 9; Alto: ≤ 16; Muito alto: > 16;",
    "• Consideração de medidas de prevenção existentes e definição de plano de ação;",
    "• Revisão periódica conforme NR-1 (em regra a cada 2 anos, ou antes em caso de mudanças, acidentes ou ineficácia das medidas).",
    "Quando necessário, complementa-se com avaliações quantitativas (ex.: ruído, agentes químicos) conforme NR aplicável.",
  ].join("\n");
}
