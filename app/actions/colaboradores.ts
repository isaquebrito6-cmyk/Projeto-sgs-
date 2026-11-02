"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, assertEmpresaAccess, empresaIdFilter } from "@/lib/tenant";

export type ColaboradorFormData = {
  nome: string;
  cpf: string;
  dataNascimento?: string;
  sexo?: string;
  email?: string;
  telefone?: string;
  dataAdmissao?: string;
  empresaId: string;
  setorId?: string;
  funcaoId?: string;
  fotoUrl?: string;
};

function cleanCPF(cpf: string) {
  return cpf.replace(/\D/g, "");
}

/** Limita tamanho da data URL (~350 KB chars) para não estourar o banco */
function sanitizeFoto(foto?: string | null) {
  if (!foto?.trim()) return null;
  const t = foto.trim();
  if (!t.startsWith("data:image/")) return null;
  if (t.length > 400_000) return null;
  return t;
}

export async function listColaboradores(empresaId?: string) {
  const user = await requireUser();
  const scoped = empresaIdFilter(user);
  const filterEmpresa = scoped || empresaId;

  return prisma.colaborador.findMany({
    where: {
      ativo: true,
      ...(filterEmpresa ? { empresaId: filterEmpresa } : {}),
    },
    orderBy: { nome: "asc" },
    include: {
      empresa: { select: { id: true, razaoSocial: true, nomeFantasia: true } },
      setor: { select: { id: true, nome: true } },
      funcao: { select: { id: true, nome: true } },
    },
  });
}

export async function getColaborador(id: string) {
  const user = await requireUser();

  const colab = await prisma.colaborador.findUnique({
    where: { id },
    include: {
      empresa: true,
      setor: true,
      funcao: true,
      asos: { orderBy: { dataEmissao: "desc" }, take: 10 },
      solicitacoesExame: { orderBy: { dataSolicitacao: "desc" }, take: 10 },
    },
  });

  if (!colab) return null;
  assertEmpresaAccess(user, colab.empresaId);
  return colab;
}

export async function createColaborador(data: ColaboradorFormData) {
  const user = await requireUser();
  assertEmpresaAccess(user, data.empresaId);

  const cpf = cleanCPF(data.cpf);
  const existing = await prisma.colaborador.findFirst({
    where: { empresaId: data.empresaId, cpf },
  });
  if (existing) return { error: "Já existe um colaborador com este CPF nesta empresa." };

  const colaborador = await prisma.colaborador.create({
    data: {
      nome: data.nome.trim(),
      cpf,
      dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : null,
      sexo: data.sexo || null,
      email: data.email?.trim() || null,
      telefone: data.telefone?.trim() || null,
      dataAdmissao: data.dataAdmissao ? new Date(data.dataAdmissao) : null,
      empresaId: data.empresaId,
      setorId: data.setorId || null,
      funcaoId: data.funcaoId || null,
      fotoUrl: sanitizeFoto(data.fotoUrl),
    },
  });

  revalidatePath("/colaboradores");
  revalidatePath(`/empresas/${data.empresaId}`);
  return { success: true, id: colaborador.id };
}

export async function updateColaborador(id: string, data: ColaboradorFormData) {
  const user = await requireUser();
  assertEmpresaAccess(user, data.empresaId);

  const cpf = cleanCPF(data.cpf);
  const existing = await prisma.colaborador.findFirst({
    where: { empresaId: data.empresaId, cpf, NOT: { id } },
  });
  if (existing) return { error: "Já existe outro colaborador com este CPF nesta empresa." };

  await prisma.colaborador.update({
    where: { id },
    data: {
      nome: data.nome.trim(),
      cpf,
      dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : null,
      sexo: data.sexo || null,
      email: data.email?.trim() || null,
      telefone: data.telefone?.trim() || null,
      dataAdmissao: data.dataAdmissao ? new Date(data.dataAdmissao) : null,
      empresaId: data.empresaId,
      setorId: data.setorId || null,
      funcaoId: data.funcaoId || null,
      fotoUrl: sanitizeFoto(data.fotoUrl),
    },
  });

  revalidatePath("/colaboradores");
  revalidatePath(`/colaboradores/${id}`);
  revalidatePath(`/empresas/${data.empresaId}`);
  return { success: true };
}

export async function deleteColaborador(id: string) {
  const user = await requireUser();

  const atual = await prisma.colaborador.findUnique({ where: { id } });
  if (!atual) return { error: "Colaborador não encontrado." };
  assertEmpresaAccess(user, atual.empresaId);

  await prisma.colaborador.update({ where: { id }, data: { ativo: false } });
  revalidatePath("/colaboradores");
  revalidatePath(`/empresas/${atual.empresaId}`);
  return { success: true };
}
