/** Utilitários para limpar texto de OCR e montar linhas Nome;CPF */

const CPF_RE = /\b(\d{3}[\.\s]?\d{3}[\.\s]?\d{3}[-\s]?\d{2}|\d{11})\b/g;

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

function looksLikeName(s: string) {
  const t = s.trim();
  if (t.length < 5 || t.length > 80) return false;
  if (/\d{5,}/.test(t)) return false;
  // pelo menos 2 palavras com letras
  const words = t.split(/\s+/).filter((w) => /[A-Za-zÀ-ÿ]{2,}/.test(w));
  return words.length >= 2;
}

/**
 * Converte texto bruto (OCR ou colado bagunçado) em linhas CSV:
 * Nome;CPF;Setor;Função
 */
export function textoOcrParaCsv(raw: string): string {
  const text = raw
    .replace(/\r/g, "\n")
    .replace(/[|]/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();

  if (!text) return "";

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  const rows: string[] = ["Nome;CPF;Setor;Função"];
  const usedCpfs = new Set<string>();

  // 1) Linhas que já parecem CSV/TSV
  for (const line of lines) {
    if (/[;\t,]/.test(line) && /\d{3}/.test(line)) {
      const parts = line.split(/[;\t,]/).map((p) => p.trim());
      const cpfPart = parts.find((p) => onlyDigits(p).length === 11);
      const nomePart = parts.find((p) => looksLikeName(p));
      if (cpfPart && nomePart) {
        const cpf = onlyDigits(cpfPart);
        if (!usedCpfs.has(cpf)) {
          usedCpfs.add(cpf);
          rows.push(`${nomePart};${cpf};;`);
        }
      }
    }
  }

  // 2) Varre texto procurando CPF e nome na mesma linha ou linha anterior
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matches = [...line.matchAll(CPF_RE)];
    for (const m of matches) {
      const cpf = onlyDigits(m[1]);
      if (cpf.length !== 11 || usedCpfs.has(cpf)) continue;

      let nome = line.replace(m[0], " ").replace(/\s+/g, " ").trim();
      if (!looksLikeName(nome) && i > 0) {
        const prev = lines[i - 1];
        if (looksLikeName(prev)) nome = prev;
      }
      if (!looksLikeName(nome) && i + 1 < lines.length) {
        const next = lines[i + 1];
        if (looksLikeName(next)) nome = next;
      }

      if (looksLikeName(nome)) {
        usedCpfs.add(cpf);
        rows.push(`${nome};${cpf};;`);
      }
    }
  }

  // Se só achou CPFs sem nome, ainda assim devolve para revisão manual no textarea
  if (rows.length === 1) {
    return text;
  }

  return rows.join("\n");
}
