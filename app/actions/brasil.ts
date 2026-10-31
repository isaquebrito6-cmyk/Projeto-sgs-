"use server";

import { buscarCEP, buscarCNPJ, isValidCPF, onlyDigits, formatCPFMask } from "@/lib/brasil";
import { prisma } from "@/lib/prisma";

export async function actionBuscarCEP(cep: string) {
  return buscarCEP(cep);
}

export async function actionBuscarCNPJ(cnpj: string) {
  return buscarCNPJ(cnpj);
}

export async function actionValidarCPF(cpf: string) {
  const d = onlyDigits(cpf);
  if (d.length !== 11) return { valid: false, message: "CPF deve ter 11 dígitos." };
  if (!isValidCPF(d)) return { valid: false, message: "CPF inválido." };
  return { valid: true, message: "CPF válido." };
}

export type CpfLookupResult = {
  cpf: string;
  nome?: string;
  dataNascimento?: string;
  sexo?: string;
  email?: string;
  telefone?: string;
  fonte: "interno" | "api" | "validacao";
  message: string;
};

/**
 * Busca dados por CPF:
 * 1) Valida o número
 * 2) Procura na base do SGS (colaborador já cadastrado)
 * 3) Se houver CPF_API_URL + CPF_API_TOKEN, consulta API externa
 */
export async function actionBuscarCPF(cpf: string): Promise<CpfLookupResult | { error: string }> {
  const d = onlyDigits(cpf);
  if (d.length !== 11) return { error: "CPF deve ter 11 dígitos." };
  if (!isValidCPF(d)) return { error: "CPF inválido." };

  // 1) Base interna do sistema
  try {
    const interno = await prisma.colaborador.findFirst({
      where: { cpf: d, ativo: true },
      orderBy: { updatedAt: "desc" },
    });

    if (interno) {
      return {
        cpf: formatCPFMask(d),
        nome: interno.nome,
        dataNascimento: interno.dataNascimento
          ? new Date(interno.dataNascimento).toISOString().slice(0, 10)
          : undefined,
        sexo: interno.sexo || undefined,
        email: interno.email || undefined,
        telefone: interno.telefone || undefined,
        fonte: "interno",
        message: "Dados encontrados na base do SGS.",
      };
    }
  } catch {
    // banco indisponível — segue para API
  }

  // 2) API externa (opcional)
  const apiUrl = process.env.CPF_API_URL;
  const apiToken = process.env.CPF_API_TOKEN;

  if (apiUrl && apiToken) {
    try {
      const url = apiUrl.includes("{cpf}")
        ? apiUrl.replace("{cpf}", d)
        : `${apiUrl.replace(/\/$/, "")}/${d}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        const nome =
          data.nome || data.name || data.nome_completo || data.nomeCompleto || "";
        const nasc =
          data.data_nascimento ||
          data.dataNascimento ||
          data.birthDate ||
          data.nascimento ||
          "";

        if (nome) {
          return {
            cpf: formatCPFMask(d),
            nome: String(nome),
            dataNascimento: nasc ? String(nasc).slice(0, 10) : undefined,
            sexo: data.sexo || data.genero || undefined,
            email: data.email || undefined,
            telefone: data.telefone || data.phone || undefined,
            fonte: "api",
            message: "Dados encontrados via API de CPF.",
          };
        }
      }
    } catch {
      // falha na API
    }
  }

  return {
    cpf: formatCPFMask(d),
    fonte: "validacao",
    message:
      "CPF válido. Nome e demais dados não estão disponíveis em API pública gratuita (LGPD). Preencha manualmente ou configure CPF_API_URL + CPF_API_TOKEN.",
  };
}
