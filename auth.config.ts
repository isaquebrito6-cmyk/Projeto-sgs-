import type { NextAuthConfig } from "next-auth";

const PUBLIC = ["/", "/login"];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    // Sessão expira em 8h de inatividade relativa (JWT maxAge)
    maxAge: 8 * 60 * 60,
  },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      const isPublic =
        PUBLIC.includes(pathname) ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/manifest") ||
        pathname === "/icon";

      if (!isLoggedIn && !isPublic) return false;

      if (isLoggedIn && pathname.startsWith("/login")) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // Bloqueio básico por papel (defesa em profundidade; actions também checam)
      if (isLoggedIn && auth?.user) {
        const role = (auth.user as { role?: string }).role || "EMPRESA";
        if (role === "CLINICA" || role === "MEDICO") {
          const blockedPrefixes = [
            "/colaboradores",
            "/pgr",
            "/pcmso",
            "/treinamentos",
            "/cat",
            "/pt",
            "/pet",
            "/ppp",
            "/empresas",
          ];
          if (blockedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
            return Response.redirect(new URL("/exames", nextUrl));
          }
        }
        if (role === "EMPRESA") {
          if (pathname === "/clinicas" || pathname.startsWith("/clinicas/")) {
            // empresa pode ver lista de clínicas para encaminhar exame — permitir leitura
            // criação continua restrita nas actions
          }
        }
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        const u = user as {
          role?: "ADMIN" | "EMPRESA" | "CLINICA" | "MEDICO";
          empresaId?: string | null;
          clinicaId?: string | null;
        };
        token.role = u.role;
        token.empresaId = u.empresaId ?? null;
        token.clinicaId = u.clinicaId ?? null;
      }
      // Marca tempo para eventual revalidação de claims no auth.ts (session callback)
      if (trigger === "signIn" || trigger === "signUp") {
        token.claimsCheckedAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        (session.user as { role?: string }).role = (token.role as string) || "EMPRESA";
        (session.user as { empresaId?: string | null }).empresaId =
          (token.empresaId as string | null | undefined) ?? null;
        (session.user as { clinicaId?: string | null }).clinicaId =
          (token.clinicaId as string | null | undefined) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
