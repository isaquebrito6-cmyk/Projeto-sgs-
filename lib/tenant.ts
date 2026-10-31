import { auth } from "@/auth";
import type { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  empresaId?: string | null;
  clinicaId?: string | null;
};

export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");
  return session.user as SessionUser;
}

export function isAdmin(user: SessionUser) {
  return user.role === "ADMIN";
}

/** Filtro de empresa: ADMIN vê tudo; EMPRESA só a sua */
export function empresaScope(user: SessionUser): { empresaId?: string } | { id: string } | Record<string, never> {
  if (isAdmin(user)) return {};
  if (user.role === "EMPRESA" && user.empresaId) return { id: user.empresaId };
  // Clínica/médico não listam empresas livres
  if (user.role === "CLINICA" || user.role === "MEDICO") return { id: "__none__" };
  return {};
}

export function empresaIdFilter(user: SessionUser): string | undefined {
  if (isAdmin(user)) return undefined;
  if (user.role === "EMPRESA") return user.empresaId || "__none__";
  return undefined;
}

/** Clínica: ADMIN vê tudo; CLINICA/MEDICO só a sua */
export function clinicaIdFilter(user: SessionUser): string | undefined {
  if (isAdmin(user)) return undefined;
  if (user.role === "CLINICA" || user.role === "MEDICO") {
    return user.clinicaId || "__none__";
  }
  return undefined;
}

export function assertEmpresaAccess(user: SessionUser, empresaId: string) {
  if (isAdmin(user)) return;
  if (user.role === "EMPRESA" && user.empresaId === empresaId) return;
  throw new Error("Acesso negado a esta empresa.");
}

export function assertClinicaAccess(user: SessionUser, clinicaId: string) {
  if (isAdmin(user)) return;
  if ((user.role === "CLINICA" || user.role === "MEDICO") && user.clinicaId === clinicaId) return;
  throw new Error("Acesso negado a esta clínica.");
}

/** Quem pode criar empresas/clínicas (cadastro master) */
export function canManageCatalog(user: SessionUser) {
  return isAdmin(user);
}
