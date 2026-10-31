import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      const isPublic = pathname === "/" || pathname.startsWith("/login");

      if (!isLoggedIn && !isPublic) return false;
      if (isLoggedIn && pathname.startsWith("/login")) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const u = user as {
          role?: "ADMIN" | "EMPRESA" | "CLINICA" | "MEDICO";
          empresaId?: string | null;
          clinicaId?: string | null;
        };
        token.role = u.role;
        token.empresaId = u.empresaId;
        token.clinicaId = u.clinicaId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { empresaId?: string | null }).empresaId =
          token.empresaId as string | null | undefined;
        (session.user as { clinicaId?: string | null }).clinicaId =
          token.clinicaId as string | null | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
