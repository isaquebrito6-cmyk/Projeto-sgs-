/** Utilitários para limpar texto de OCR e montar linhas Nome;CPF;Setor;Função */

const CPF_RE = /\b(\d{3}[\.\s]?\d{3}[\.\s]?\d{3}[-\s]?\d{2}|\d{11})\b/g;

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

function looksLikeName(s: string) {
  const t = s.trim();
  if (t.length < 5 || t.length > 90) return false;
  if (/\d{5,}/.test(t)) return false;
  if (/^(nome|cpf|setor|funcao|função|cargo|rg|data)/i.test(t)) return false;
  const words = t.split(/\s+/).filter((w) => /[A-Za-zÀ-ÿ]{2,}/.test(w));
  return words.length >= 2;
}

/** Extrai um único colaborador do texto (documento / ficha) */
export function extrairColaboradorDoTexto(raw: string): {
  nome?: string;
  cpf?: string;
  setor?: string;
  funcao?: string;
  email?: string;
  telefone?: string;
} {
  const text = raw.replace(/\r/g, "\n").replace(/[|]/g, " ");
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 1);

  const full = lines.join(" ");
  const out: {
    nome?: string;
    cpf?: string;
    setor?: string;
    funcao?: string;
    email?: string;
    telefone?: string;
  } = {};

  // CPF
  const cpfMatches = [...full.matchAll(CPF_RE)];
  for (const m of cpfMatches) {
    const d = onlyDigits(m[1]);
    if (d.length === 11) {
      out.cpf = d;
      break;
    }
  }

  // Nome rotulado
  for (const line of lines) {
    const m = line.match(/nome\s*[:\-]?\s*(.+)/i);
    if (m && looksLikeName(m[1])) {
      out.nome = m[1].trim();
      break;
    }
  }
  // Nome na linha anterior ao CPF
  if (!out.nome && out.cpf) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(out.cpf.slice(0, 3)) || onlyDigits(lines[i]).includes(out.cpf.slice(0, 9))) {
        if (i > 0 && looksLikeName(lines[i - 1])) out.nome = lines[i - 1];
        else {
          const semCpf = lines[i].replace(CPF_RE, " ").replace(/\s+/g, " ").trim();
          if (looksLikeName(semCpf)) out.nome = semCpf;
        }
        break;
      }
    }
  }
  // Qualquer linha que pareça nome completo
  if (!out.nome) {
    for (const line of lines) {
      if (looksLikeName(line)) {
        out.nome = line;
        break;
      }
    }
  }

  for (const line of lines) {
    const setor = line.match(/(?:setor|departamento)\s*[:\-]?\s*(.+)/i);
    if (setor && !out.setor) out.setor = setor[1].trim().slice(0, 60);

    const funcao = line.match(/(?:fun[cç][aã]o|cargo)\s*[:\-]?\s*(.+)/i);
    if (funcao && !out.funcao) out.funcao = funcao[1].trim().slice(0, 60);

    const email = line.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i);
    if (email && !out.email) out.email = email[0];

    const tel = line.match(/(?:tel|fone|celular)?\s*[:\-]?\s*(\(?\d{2}\)?\s*\d{4,5}[-\s]?\d{4})\b/i);
    if (tel && !out.telefone) out.telefone = tel[1].trim();
  }

  return out;
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
          const setor = parts.find((p, i) => i > 1 && p && p !== nomePart && onlyDigits(p).length !== 11);
          rows.push(`${nomePart};${cpf};${setor || ""};`);
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

  if (rows.length === 1) {
    // tenta extrair pelo menos 1 registro rotulado
    const one = extrairColaboradorDoTexto(raw);
    if (one.nome || one.cpf) {
      rows.push(`${one.nome || ""};${one.cpf || ""};${one.setor || ""};${one.funcao || ""}`);
      return rows.join("\n");
    }
    return text;
  }

  return rows.join("\n");
}
