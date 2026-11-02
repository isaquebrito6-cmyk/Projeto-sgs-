"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, assertEmpresaAccess } from "@/lib/tenant";
import { isValidCPF, onlyDigits } from "@/lib/brasil";

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

export type ImportResult = {
  criados: number;
  atualizados: number;
  erros: { linha: number; mensagem: string }[];
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

  const sep =
    lines[0].includes("\t") ? "\t" : lines[0].includes(";") ? ";" : ",";

  return lines.map((line) =>
    line.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""))
  );
}

/** Mapeia cabeçalho flexível → campos */
function mapHeader(h: string): keyof ImportRow | null {
  const n = h
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

  if (n.includes("nome")) return "nome";
  if (n === "cpf" || n.includes("cpf")) return "cpf";
  if (n.includes("setor") || n.includes("departamento")) return "setor";
  if (n.includes("funcao") || n.includes("cargo") || n.includes("função")) return "funcao";
  if (n.includes("email") || n.includes("e-mail")) return "email";
  if (n.includes("telefone") || n.includes("celular") || n.includes("fone")) return "telefone";
  if (n.includes("admiss") || n.includes("admissão")) return "dataAdmissao";
  if (n === "sexo" || n.includes("genero") || n.includes("gênero")) return "sexo";
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
  let cols = mapped;

  if (hasHeader && (mapped.includes("nome") || mapped.includes("cpf"))) {
    start = 1;
  } else {
    // sem cabeçalho: assume nome, cpf, setor, função
    cols = ["nome", "cpf", "setor", "funcao", "email", "telefone"];
    avisos.push("Cabeçalho não detectado — usando ordem: Nome, CPF, Setor, Função, E-mail, Telefone.");
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

export async function importColaboradores(
  empresaId: string,
  texto: string
): Promise<ImportResult | { error: string }> {
  try {
    const user = await requireUser();
    assertEmpresaAccess(user, empresaId);

    const { rows } = parseImportRows(texto);
    if (rows.length === 0) return { error: "Nenhum registro válido para importar." };

    const setores = await prisma.setor.findMany({
      where: { empresaId },
      include: { funcoes: true },
    });

    const setorByName = new Map(
      setores.map((s) => [s.nome.toLowerCase().trim(), s])
    );

    let criados = 0;
    let atualizados = 0;
    const erros: { linha: number; mensagem: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const linha = i + 1;
      const nome = row.nome?.trim();
      const cpf = onlyDigits(row.cpf || "");

      if (!nome) {
        erros.push({ linha, mensagem: "Nome obrigatório." });
        continue;
      }
      if (cpf.length !== 11 || !isValidCPF(cpf)) {
        erros.push({ linha, mensagem: `CPF inválido (${row.cpf || "vazio"})."` });
        continue;
      }

      let setorId: string | null = null;
      let funcaoId: string | null = null;

      if (row.setor?.trim()) {
        let setor = setorByName.get(row.setor.toLowerCase().trim());
        if (!setor) {
          setor = await prisma.setor.create({
            data: { nome: row.setor.trim(), empresaId },
            include: { funcoes: true },
          });
          setorByName.set(setor.nome.toLowerCase().trim(), setor);
        }
        setorId = setor.id;

        if (row.funcao?.trim()) {
          const fn = setor.funcoes.find(
            (f) => f.nome.toLowerCase().trim() === row.funcao!.toLowerCase().trim()
          );
          if (fn) {
            funcaoId = fn.id;
          } else {
            const created = await prisma.funcao.create({
              data: { nome: row.funcao.trim(), setorId: setor.id },
            });
            setor.funcoes.push(created);
            funcaoId = created.id;
          }
        }
      }

      let dataAdmissao: Date | null = null;
      if (row.dataAdmissao) {
        const d = new Date(row.dataAdmissao);
        if (!isNaN(d.getTime())) dataAdmissao = d;
      }

      const existing = await prisma.colaborador.findFirst({
        where: { empresaId, cpf },
      });

      if (existing) {
        await prisma.colaborador.update({
          where: { id: existing.id },
          data: {
            nome,
            email: row.email?.trim() || existing.email,
            telefone: row.telefone?.trim() || existing.telefone,
            sexo: row.sexo?.trim() || existing.sexo,
            dataAdmissao: dataAdmissao || existing.dataAdmissao,
            setorId: setorId || existing.setorId,
            funcaoId: funcaoId || existing.funcaoId,
            ativo: true,
          },
        });
        atualizados++;
      } else {
        await prisma.colaborador.create({
          data: {
            nome,
            cpf,
            email: row.email?.trim() || null,
            telefone: row.telefone?.trim() || null,
            sexo: row.sexo?.trim() || null,
            dataAdmissao,
            empresaId,
            setorId,
            funcaoId,
          },
        });
        criados++;
      }
    }

    revalidatePath("/colaboradores");
    revalidatePath(`/empresas/${empresaId}`);
    return { criados, atualizados, erros };
  } catch (err) {
    console.error("[importColaboradores]", err);
    return { error: "Erro ao importar. Verifique o banco e tente novamente." };
  }
}
