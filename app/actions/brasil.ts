"use server";

import { buscarCEP, buscarCNPJ, isValidCPF, onlyDigits } from "@/lib/brasil";

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
