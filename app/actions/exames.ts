"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  requireUser,
  isAdmin,
  assertEmpresaAccess,
  assertClinicaAccess,
  empresaIdFilter,
  clinicaIdFilter,
} from "@/lib/tenant";

export type SolicitacaoFormData = {
  tipoExame: string;
  empresaId: string;
  colaboradorId: string;
  clinicaId?: string;
  riscosInformados?: string;
  examesSolicitados?: string;
  observacoes?: string;
};

export type ASOFormData = {
  solicitacaoId: string;
  dataExame?: string;
  riscosOcupacionais?: string;
  examesRealizados?: string;
  conclusao: string;
  restricoes?: string;
  medicoNome?: string;
  medicoCrm?: string;
  medicoCrmUf?: string;
  medicoCoordNome?: string;
  medicoCoordCrm?: string;
  observacoes?: string;
  checklistPsicossocial?: string;
};

export async function listSolicitacoes(filters?: {
  empresaId?: string;
  clinicaId?: string;
  status?: string;
}) {
  const user = await requireUser();

  const scopedEmpresa = empresaIdFilter(user);
  const scopedClinica = clinicaIdFilter(user);

  return prisma.solicitacaoExame.findMany({
    where: {
      ...(scopedEmpresa
        ? { empresaId: scopedEmpresa }
        : filters?.empresaId
          ? { empresaId: filters.empresaId }
          : {}),
      ...(scopedClinica
        ? { clinicaId: scopedClinica }
        : filters?.clinicaId
          ? { clinicaId: filters.clinicaId }
          : {}),
      ...(filters?.status ? { status: filters.status as any } : {}),
    },
    orderBy: { dataSolicitacao: "desc" },
    include: {
      empresa: { select: { id: true, razaoSocial: true, nomeFantasia: true } },
      colaborador: {
        select: { id: true, nome: true, cpf: true, funcao: { select: { nome: true } } },
      },
      clinica: { select: { id: true, razaoSocial: true, nomeFantasia: true } },
      aso: { select: { id: true, conclusao: true, dataEmissao: true } },
    },
  });
}

export async function getSolicitacao(id: string) {
  const user = await requireUser();

  const sol = await prisma.solicitacaoExame.findUnique({
    where: { id },
    include: {
      empresa: true,
      colaborador: { include: { funcao: true, setor: true } },
      clinica: { include: { medicos: { where: { ativo: true } } } },
      aso: true,
    },
  });

  if (!sol) return null;

  if (user.role === "EMPRESA") assertEmpresaAccess(user, sol.empresaId);
  if (user.role === "CLINICA" || user.role === "MEDICO") {
    if (sol.clinicaId) assertClinicaAccess(user, sol.clinicaId);
    else if (!isAdmin(user)) throw new Error("Acesso negado.");
  }

  return sol;
}

export async function createSolicitacao(data: SolicitacaoFormData) {
  const user = await requireUser();
  assertEmpresaAccess(user, data.empresaId);

  let riscos = data.riscosInformados;
  if (!riscos) {
    const pcmso = await prisma.pCMSO.findFirst({
      where: { empresaId: data.empresaId, status: { not: "VENCIDO" } },
      include: {
        pgr: { include: { inventarioItens: { include: { risco: true } } } },
      },
      orderBy: { dataElaboracao: "desc" },
    });

    if (pcmso?.pgr?.inventarioItens.length) {
      riscos = pcmso.pgr.inventarioItens
        .map(
          (i) =>
            `${i.risco.nome} (${i.risco.tipo})${i.nivelRisco ? ` — ${i.nivelRisco}` : ""}`
        )
        .join("; ");
    }
  }

  const sol = await prisma.solicitacaoExame.create({
    data: {
      tipoExame: data.tipoExame,
      empresaId: data.empresaId,
      colaboradorId: data.colaboradorId,
      clinicaId: data.clinicaId || null,
      riscosInformados: riscos || null,
      examesSolicitados: data.examesSolicitados || "Exame clínico ocupacional",
      observacoes: data.observacoes || null,
      status: data.clinicaId ? "ENVIADA_CLINICA" : "PENDENTE",
    },
  });

  revalidatePath("/exames");
  return { success: true, id: sol.id };
}

export async function emitirASO(data: ASOFormData) {
  const user = await requireUser();

  const sol = await prisma.solicitacaoExame.findUnique({
    where: { id: data.solicitacaoId },
    include: {
      empresa: true,
      colaborador: { include: { funcao: true } },
      clinica: true,
      aso: true,
    },
  });

  if (!sol) return { error: "Solicitação não encontrada." };
  if (sol.aso) return { error: "ASO já foi emitido para esta solicitação." };
  if (!sol.clinicaId) return { error: "Solicitação sem clínica vinculada." };

  // Clínica/médico só emite da própria clínica; admin/empresa também podem
  if (user.role === "CLINICA" || user.role === "MEDICO") {
    assertClinicaAccess(user, sol.clinicaId);
  } else if (user.role === "EMPRESA") {
    assertEmpresaAccess(user, sol.empresaId);
  }

  const aso = await prisma.aSO.create({
    data: {
      solicitacaoId: sol.id,
      colaboradorId: sol.colaboradorId,
      clinicaId: sol.clinicaId,
      dataExame: data.dataExame ? new Date(data.dataExame) : new Date(),
      razaoSocialEmpresa: sol.empresa.razaoSocial,
      cnpjEmpresa: sol.empresa.cnpj,
      nomeColaborador: sol.colaborador.nome,
      cpfColaborador: sol.colaborador.cpf,
      funcaoColaborador: sol.colaborador.funcao?.nome || null,
      riscosOcupacionais:
        data.riscosOcupacionais ||
        sol.riscosInformados ||
        "Não há riscos que necessitem de controle médico específico",
      examesRealizados:
        data.examesRealizados || sol.examesSolicitados || "Exame clínico ocupacional",
      conclusao: data.conclusao,
      restricoes: data.restricoes || null,
      medicoNome: data.medicoNome || null,
      medicoCrm: data.medicoCrm || null,
      medicoCrmUf: data.medicoCrmUf || null,
      medicoCoordNome: data.medicoCoordNome || null,
      medicoCoordCrm: data.medicoCoordCrm || null,
      observacoes: data.observacoes || null,
      checklistPsicossocial: data.checklistPsicossocial || null,
    },
  });

  await prisma.solicitacaoExame.update({
    where: { id: sol.id },
    data: { status: "ASO_EMITIDO" },
  });

  revalidatePath("/exames");
  revalidatePath(`/exames/${sol.id}`);
  return { success: true, id: aso.id };
}
