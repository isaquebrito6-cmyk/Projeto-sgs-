/** Aniversários de idade (nascimento) e de empresa (admissão) */

export type AvisoAniversario = {
  colaboradorId: string;
  nome: string;
  empresaNome: string;
  tipo: "idade" | "empresa";
  /** Dias até a data (0 = hoje) */
  dias: number;
  /** Data deste ano/próximo no formato dd/mm */
  dataLabel: string;
  /** Idade que completa ou anos de empresa */
  marca: number;
};

/** Dias de antecedência para destacar no painel */
export const ANTECEDENCIA_DIAS = 7;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Próxima ocorrência de dia/mês a partir de hoje (inclui hoje) */
export function proximaOcorrencia(mes: number, dia: number, ref = new Date()): Date {
  const hoje = startOfDay(ref);
  let alvo = new Date(hoje.getFullYear(), mes - 1, dia);
  alvo = startOfDay(alvo);
  if (alvo < hoje) {
    alvo = new Date(hoje.getFullYear() + 1, mes - 1, dia);
    alvo = startOfDay(alvo);
  }
  return alvo;
}

export function diasAte(data: Date, ref = new Date()): number {
  const a = startOfDay(ref).getTime();
  const b = startOfDay(data).getTime();
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}

function formatDiaMes(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function calcularAvisosAniversario(
  colaboradores: {
    id: string;
    nome: string;
    dataNascimento: Date | null;
    dataAdmissao: Date | null;
    empresa: { nomeFantasia: string | null; razaoSocial: string };
  }[],
  antecedencia = ANTECEDENCIA_DIAS,
  ref = new Date()
): AvisoAniversario[] {
  const avisos: AvisoAniversario[] = [];
  const anoRef = ref.getFullYear();

  for (const c of colaboradores) {
    const empresaNome = c.empresa.nomeFantasia || c.empresa.razaoSocial;

    if (c.dataNascimento) {
      const nasc = new Date(c.dataNascimento);
      const mes = nasc.getMonth() + 1;
      const dia = nasc.getDate();
      const prox = proximaOcorrencia(mes, dia, ref);
      const dias = diasAte(prox, ref);
      if (dias >= 0 && dias <= antecedencia) {
        const idade = prox.getFullYear() - nasc.getFullYear();
        avisos.push({
          colaboradorId: c.id,
          nome: c.nome,
          empresaNome,
          tipo: "idade",
          dias,
          dataLabel: formatDiaMes(prox),
          marca: idade,
        });
      }
    }

    if (c.dataAdmissao) {
      const adm = new Date(c.dataAdmissao);
      const mes = adm.getMonth() + 1;
      const dia = adm.getDate();
      const prox = proximaOcorrencia(mes, dia, ref);
      const dias = diasAte(prox, ref);
      // só faz sentido a partir do 1º ano
      const anos = prox.getFullYear() - adm.getFullYear();
      if (anos >= 1 && dias >= 0 && dias <= antecedencia) {
        avisos.push({
          colaboradorId: c.id,
          nome: c.nome,
          empresaNome,
          tipo: "empresa",
          dias,
          dataLabel: formatDiaMes(prox),
          marca: anos,
        });
      }
    }
  }

  // Hoje primeiro, depois por dias; idade antes de empresa no mesmo dia
  avisos.sort((a, b) => {
    if (a.dias !== b.dias) return a.dias - b.dias;
    if (a.tipo !== b.tipo) return a.tipo === "idade" ? -1 : 1;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });

  return avisos;
}

export function labelAntecedencia(dias: number): string {
  if (dias === 0) return "Hoje";
  if (dias === 1) return "Amanhã";
  return `Em ${dias} dias`;
}
