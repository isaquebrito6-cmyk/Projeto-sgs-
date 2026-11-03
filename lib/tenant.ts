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
  const u = session.user as SessionUser;
  if (!u.role) throw new Error("Sessão inválida");
  return u;
}

export function isAdmin(user: SessionUser) {
  return user.role === "ADMIN";
}

/**
 * Filtro de empresaId em queries.
 * - ADMIN: undefined = sem filtro (vê tudo)
 * - EMPRESA: só a empresa vinculada
 * - CLINICA/MEDICO: "__none__" = não vê listas globais de empresa/colaboradores
 *   (acesso pontual via solicitações da própria clínica)
 */
export function empresaIdFilter(user: SessionUser): string | undefined {
  if (isAdmin(user)) return undefined;
  if (user.role === "EMPRESA") {
    return user.empresaId?.trim() || "__none__";
  }
  // Clínica e médico não enxergam o cadastro global de empresas/colaboradores
  return "__none__";
}

/** Clínica: ADMIN vê tudo; CLINICA/MEDICO só a sua */
export function clinicaIdFilter(user: SessionUser): string | undefined {
  if (isAdmin(user)) return undefined;
  if (user.role === "CLINICA" || user.role === "MEDICO") {
    return user.clinicaId?.trim() || "__none__";
  }
  // Empresa não lista clínicas “de todos” — só as que escolher no formulário (sem filtro global de dados clínicos)
  return undefined;
}

export function assertEmpresaAccess(user: SessionUser, empresaId: string) {
  if (isAdmin(user)) return;
  if (user.role === "EMPRESA" && user.empresaId && user.empresaId === empresaId) return;
  throw new Error("Acesso negado a esta empresa.");
}

export function assertClinicaAccess(user: SessionUser, clinicaId: string) {
  if (isAdmin(user)) return;
  if (
    (user.role === "CLINICA" || user.role === "MEDICO") &&
    user.clinicaId &&
    user.clinicaId === clinicaId
  ) {
    return;
  }
  throw new Error("Acesso negado a esta clínica.");
}

/** Cadastro master de empresas/clínicas — só ADMIN */
export function canManageCatalog(user: SessionUser) {
  return isAdmin(user);
}

/** Menus / rotas permitidos por papel */
export function allowedNavHrefs(role: Role): string[] {
  switch (role) {
    case "ADMIN":
      return [
        "/dashboard",
        "/empresas",
        "/clinicas",
        "/colaboradores",
        "/pgr",
        "/pcmso",
        "/exames",
        "/treinamentos",
        "/cat",
        "/pt",
        "/pet",
        "/ppp",
      ];
    case "EMPRESA":
      return [
        "/dashboard",
        "/empresas",
        "/colaboradores",
        "/pgr",
        "/pcmso",
        "/exames",
        "/treinamentos",
        "/cat",
        "/pt",
        "/pet",
        "/ppp",
      ];
    case "CLINICA":
    case "MEDICO":
      return ["/dashboard", "/exames", "/clinicas"];
    default:
      return ["/dashboard"];
  }
}

export function canAccessPath(user: SessionUser, pathname: string): boolean {
  if (isAdmin(user)) return true;
  const allowed = allowedNavHrefs(user.role);
  // permite subrotas (ex. /colaboradores/xyz)
  return allowed.some(
    (href) => pathname === href || pathname.startsWith(`${href}/`)
  );
}
