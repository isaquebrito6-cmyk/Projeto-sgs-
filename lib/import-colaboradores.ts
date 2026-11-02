/** Parsers de lista de colaboradores (CSV / colar / OCR) — não é Server Action */

export type ImportRow = {
  nome: string;
  cpf: string;
  setor?: string;
  funcao?: string;
  email?: string;
  telefone?: string;
  dataAdmissao?: string;
  sexo?: string;
};

/** Separa CSV/TSV/colar por linha e detecta separador */
export function parseTabelaTexto(texto: string): string[][] {
  const lines = texto
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const sep = lines[0].includes("\t") ? "\t" : lines[0].includes(";") ? ";" : ",";

  return lines.map((line) =>
    line.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""))
  );
}

function mapHeader(h: string): keyof ImportRow | null {
  const n = h
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

  if (n.includes("nome")) return "nome";
  if (n === "cpf" || n.includes("cpf")) return "cpf";
  if (n.includes("setor") || n.includes("departamento")) return "setor";
  if (n.includes("funcao") || n.includes("cargo")) return "funcao";
  if (n.includes("email") || n.includes("e-mail")) return "email";
  if (n.includes("telefone") || n.includes("celular") || n.includes("fone")) return "telefone";
  if (n.includes("admiss")) return "dataAdmissao";
  if (n === "sexo" || n.includes("genero")) return "sexo";
  return null;
}

export function parseImportRows(texto: string): { rows: ImportRow[]; avisos: string[] } {
  const table = parseTabelaTexto(texto);
  const avisos: string[] = [];
  if (table.length === 0) return { rows: [], avisos: ["Nenhuma linha encontrada."] };

  const headerCells = table[0];
  const mapped = headerCells.map(mapHeader);
  const hasHeader = mapped.some((m) => m !== null);

  let start = 0;
  let cols: (keyof ImportRow | null)[] = mapped;

  if (hasHeader && (mapped.includes("nome") || mapped.includes("cpf"))) {
    start = 1;
  } else {
    cols = ["nome", "cpf", "setor", "funcao", "email", "telefone"];
    avisos.push(
      "Cabeçalho não detectado — usando ordem: Nome, CPF, Setor, Função, E-mail, Telefone."
    );
  }

  const rows: ImportRow[] = [];
  for (let i = start; i < table.length; i++) {
    const cells = table[i];
    const row: ImportRow = { nome: "", cpf: "" };
    cols.forEach((key, idx) => {
      if (!key || cells[idx] === undefined) return;
      const val = cells[idx];
      if (key === "nome") row.nome = val;
      else if (key === "cpf") row.cpf = val;
      else if (key === "setor") row.setor = val;
      else if (key === "funcao") row.funcao = val;
      else if (key === "email") row.email = val;
      else if (key === "telefone") row.telefone = val;
      else if (key === "dataAdmissao") row.dataAdmissao = val;
      else if (key === "sexo") row.sexo = val;
    });
    if (row.nome || row.cpf) rows.push(row);
  }

  return { rows, avisos };
}
