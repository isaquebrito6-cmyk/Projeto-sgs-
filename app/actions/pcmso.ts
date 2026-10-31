"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, assertEmpresaAccess, empresaIdFilter } from "@/lib/tenant";

export type PCMSOFormData = {
  titulo: string;
  empresaId: string;
  pgrId?: string;
  versao?: string;
  medicoCoordenadorId?: string;
  responsavelNome?: string;
  responsavelCrm?: string;
  objetivos?: string;
  diretrizes?: string;
};

export type ExamePCMSOData = {
  nomeExame: string;
  tipo: string;
  periodicidade?: string;
  setoresAplicaveis?: string;
  funcoesAplicaveis?: string;
  observacoes?: string;
};

export async function listPCMSOs(empresaId?: string) {
  const user = await requireUser();
  const scoped = empresaIdFilter(user);
  const filter = scoped || empresaId;

  return prisma.pCMSO.findMany({
    where: filter ? { empresaId: filter } : undefined,
    orderBy: { dataElaboracao: "desc" },
    include: {
      empresa: { select: { id: true, razaoSocial: true, nomeFantasia: true } },
      pgr: { select: { id: true, titulo: true } },
      medicoCoordenador: { select: { id: true, nome: true, crm: true, crmUf: true } },
      _count: { select: { exames: true } },
    },
  });
}

export async function getPCMSO(id: string) {
  const user = await requireUser();

  const pcmso = await prisma.pCMSO.findUnique({
    where: { id },
    include: {
      empresa: true,
      pgr: { include: { inventarioItens: { include: { risco: true } } } },
      medicoCoordenador: true,
      exames: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!pcmso) return null;
  assertEmpresaAccess(user, pcmso.empresaId);
  return pcmso;
}

export async function createPCMSO(data: PCMSOFormData) {
  const user = await requireUser();
  assertEmpresaAccess(user, data.empresaId);

  const pcmso = await prisma.pCMSO.create({
    data: {
      titulo: data.titulo.trim(),
      empresaId: data.empresaId,
      pgrId: data.pgrId || null,
      versao: data.versao || "1.0",
      medicoCoordenadorId: data.medicoCoordenadorId || null,
      responsavelNome: data.responsavelNome?.trim() || null,
      responsavelCrm: data.responsavelCrm?.trim() || null,
      objetivos: data.objetivos?.trim() || null,
      diretrizes: data.diretrizes?.trim() || null,
      status: "RASCUNHO",
    },
  });

  if (data.pgrId) {
    const pgr = await prisma.pGR.findUnique({
      where: { id: data.pgrId },
      include: { inventarioItens: { include: { risco: true } } },
    });

    if (pgr) {
      const examesPadrao = [
        { nomeExame: "Exame Clínico Ocupacional", tipo: "Admissional", periodicidade: "—" },
        { nomeExame: "Exame Clínico Ocupacional", tipo: "Periódico", periodicidade: "Anual" },
        { nomeExame: "Exame Clínico Ocupacional", tipo: "Demissional", periodicidade: "—" },
        { nomeExame: "Exame Clínico Ocupacional", tipo: "Retorno ao Trabalho", periodicidade: "—" },
        { nomeExame: "Exame Clínico Ocupacional", tipo: "Mudança de Riscos Ocupacionais", periodicidade: "—" },
      ];

      const tipos = new Set(pgr.inventarioItens.map((i) => i.risco.tipo));
      if (tipos.has("FISICO")) {
        examesPadrao.push({ nomeExame: "Audiometria", tipo: "Periódico", periodicidade: "Anual" });
      }
      if (tipos.has("QUIMICO") || tipos.has("BIOLOGICO")) {
        examesPadrao.push({ nomeExame: "Espirometria", tipo: "Periódico", periodicidade: "Anual" });
        examesPadrao.push({ nomeExame: "Hemograma completo", tipo: "Periódico", periodicidade: "Anual" });
      }

      for (const ex of examesPadrao) {
        await prisma.examePCMSO.create({ data: { pcmsoId: pcmso.id, ...ex } });
      }
    }
  }

  revalidatePath("/pcmso");
  revalidatePath("/pgr");
  return { success: true, id: pcmso.id };
}

export async function addExamePCMSO(pcmsoId: string, data: ExamePCMSOData) {
  const user = await requireUser();
  const pcmso = await prisma.pCMSO.findUnique({ where: { id: pcmsoId } });
  if (!pcmso) return { error: "PCMSO não encontrado." };
  assertEmpresaAccess(user, pcmso.empresaId);

  await prisma.examePCMSO.create({
    data: {
      pcmsoId,
      nomeExame: data.nomeExame.trim(),
      tipo: data.tipo,
      periodicidade: data.periodicidade || null,
      setoresAplicaveis: data.setoresAplicaveis || null,
      funcoesAplicaveis: data.funcoesAplicaveis || null,
      observacoes: data.observacoes || null,
    },
  });

  revalidatePath(`/pcmso/${pcmsoId}`);
  return { success: true };
}

export async function removeExamePCMSO(id: string, pcmsoId: string) {
  const user = await requireUser();
  const pcmso = await prisma.pCMSO.findUnique({ where: { id: pcmsoId } });
  if (!pcmso) return { error: "PCMSO não encontrado." };
  assertEmpresaAccess(user, pcmso.empresaId);

  await prisma.examePCMSO.delete({ where: { id } });
  revalidatePath(`/pcmso/${pcmsoId}`);
  return { success: true };
}
