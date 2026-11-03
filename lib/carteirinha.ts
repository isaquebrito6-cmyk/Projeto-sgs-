/** Montagem de dados da carteirinha SST (NRs, ASO, equipamentos) */

import { getCatalogoById } from "@/lib/nr-treinamentos";

export type TreinoResumo = {
  titulo: string;
  tipo: string;
  catalogoId: string | null;
  dataRealizacao: Date | null;
  validade: Date | null;
  presente: boolean;
};

export type AsoResumo = {
  dataEmissao: Date;
  conclusao: string;
};

/** Extrai número da NR (ex.: "10", "33", "01") a partir de tipo/título/catálogo */
export function extrairNumeroNR(texto: string): string | null {
  const t = texto.toUpperCase();
  const m = t.match(/\bNR[\s\-–]*(\d{1,2})\b/);
  if (m) return m[1].padStart(2, "0");
  // catálogo ids tipo nr10-basico
  const m2 = t.match(/\bNR(\d{1,2})\b/);
  if (m2) return m2[1].padStart(2, "0");
  return null;
}

export function listarNRsDosTreinamentos(treinos: TreinoResumo[]): {
  nr: string;
  validade: Date | null;
  titulo: string;
}[] {
  const map = new Map<string, { nr: string; validade: Date | null; titulo: string }>();

  for (const t of treinos) {
    if (!t.presente) continue;
    let nr: string | null = null;
    let validade = t.validade;

    if (t.catalogoId) {
      const cat = getCatalogoById(t.catalogoId);
      if (cat) {
        nr = extrairNumeroNR(cat.norma) || extrairNumeroNR(cat.titulo);
        // se não tem validade no registro, tenta do catálogo a partir da data
        if (!validade && t.dataRealizacao && cat.validadeMeses) {
          const d = new Date(t.dataRealizacao);
          d.setMonth(d.getMonth() + cat.validadeMeses);
          validade = d;
        }
      }
    }
    if (!nr) nr = extrairNumeroNR(t.tipo) || extrairNumeroNR(t.titulo);
    if (!nr) continue;

    const prev = map.get(nr);
    // mantém a validade mais longa / mais recente
    if (!prev) {
      map.set(nr, { nr, validade, titulo: t.titulo });
    } else if (validade && (!prev.validade || validade > prev.validade)) {
      map.set(nr, { nr, validade, titulo: t.titulo });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.nr.localeCompare(b.nr));
}

/** Equipamentos / máquinas que o treinamento habilita */
export function listarMaquinasAptas(treinos: TreinoResumo[]): string[] {
  const set = new Set<string>();
  const regras: { re: RegExp; label: string }[] = [
    { re: /empilhadeira/i, label: "Empilhadeira" },
    { re: /paleteira|carrinho industrial/i, label: "Carrinho / paleteira" },
    { re: /\bPTA\b|plataforma elevat|PEMT/i, label: "PTA / plataforma elevatória" },
    { re: /autopropelid/i, label: "Máquina autopropelida" },
    { re: /operador de m[aá]quinas|m[aá]quinas em geral/i, label: "Máquinas em geral" },
    { re: /transporte motorizado/i, label: "Transporte motorizado" },
    { re: /\bSEP\b|sistema el[eé]trico de pot[eê]ncia/i, label: "SEP (eletricidade)" },
    { re: /espa[cç]o confinado|NR[\s\-]*33/i, label: "Espaço confinado" },
    { re: /trabalho em altura|NR[\s\-]*35/i, label: "Trabalho em altura" },
  ];

  for (const t of treinos) {
    if (!t.presente) continue;
    const blob = `${t.titulo} ${t.tipo} ${t.catalogoId || ""}`;
    for (const r of regras) {
      if (r.re.test(blob)) set.add(r.label);
    }
  }
  return Array.from(set);
}

/** Validade orientativa do ASO: emissão + 12 meses (ajuste pelo PCMSO/risco) */
export function validadeAsoEstimada(dataEmissao: Date, meses = 12): Date {
  const d = new Date(dataEmissao);
  d.setMonth(d.getMonth() + meses);
  return d;
}

export function formatDateBR(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export function isVencido(d: Date | null | undefined): boolean {
  if (!d) return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x < hoje;
}
