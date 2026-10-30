"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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
};

function cleanCPF(cpf: string) {
  return cpf.replace(/\D/g, "");
}

export async function listColaboradores(empresaId?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  return prisma.colaborador.findMany({
    where: {
      ativo: true,
      ...(empresaId ? { empresaId } : {}),
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
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  return prisma.colaborador.findUnique({
    where: { id },
    include: {
      empresa: true,
      setor: true,
      funcao: true,
      asos: {
        orderBy: { dataEmissao: "desc" },
        take: 10,
      },
      solicitacoesExame: {
        orderBy: { dataSolicitacao: "desc" },
        take: 10,
      },
    },
  });
}

export async function createColaborador(data: ColaboradorFormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  const cpf = cleanCPF(data.cpf);

  const existing = await prisma.colaborador.findFirst({
    where: { empresaId: data.empresaId, cpf },
  });
  if (existing) {
    return { error: "Já existe um colaborador com este CPF nesta empresa." };
  }

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
    },
  });

  revalidatePath("/colaboradores");
  revalidatePath(`/empresas/${data.empresaId}`);
  return { success: true, id: colaborador.id };
}

export async function updateColaborador(id: string, data: ColaboradorFormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  const cpf = cleanCPF(data.cpf);

  const existing = await prisma.colaborador.findFirst({
    where: {
      empresaId: data.empresaId,
      cpf,
      NOT: { id },
    },
  });
  if (existing) {
    return { error: "Já existe outro colaborador com este CPF nesta empresa." };
  }

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
    },
  });

  revalidatePath("/colaboradores");
  revalidatePath(`/colaboradores/${id}`);
  revalidatePath(`/empresas/${data.empresaId}`);
  return { success: true };
}

export async function deleteColaborador(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  const colab = await prisma.colaborador.update({
    where: { id },
    data: { ativo: false },
  });

  revalidatePath("/colaboradores");
  revalidatePath(`/empresas/${colab.empresaId}`);
  return { success: true };
}
