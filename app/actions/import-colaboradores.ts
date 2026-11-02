"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, assertEmpresaAccess } from "@/lib/tenant";
import { isValidCPF, onlyDigits } from "@/lib/brasil";
import { parseImportRows, type ImportRow } from "@/lib/import-colaboradores";

export type { ImportRow };
export type ImportResult = {
  criados: number;
  atualizados: number;
  erros: { linha: number; mensagem: string }[];
};

/** Reexport para o formulário de pré-visualização no client */
export async function parseImportRowsAction(texto: string) {
  return parseImportRows(texto);
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
        erros.push({ linha, mensagem: `CPF inválido (${row.cpf || "vazio"}).` });
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
