import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
    empresaId?: string | null;
    clinicaId?: string | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: Role;
      empresaId?: string | null;
      clinicaId?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: Role;
    empresaId?: string | null;
    clinicaId?: string | null;
  }
}

/** Acesso de emergência / primeiro acesso — funciona mesmo se o banco falhar */
const BOOTSTRAP_ADMIN = {
  id: "bootstrap-admin",
  email: "isaquebrito6@gmail.com",
  name: "Isaque Brito",
  // senha padrão: Admin@SGS2026 — troque depois em Configurações
  password: process.env.BOOTSTRAP_PASSWORD || "Admin@SGS2026",
  role: "ADMIN" as Role,
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "sgs-dev-secret-troque-em-producao-2026",
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        // 1) Bootstrap admin (sempre disponível)
        if (
          email === BOOTSTRAP_ADMIN.email &&
          password === BOOTSTRAP_ADMIN.password
        ) {
          // Tenta sincronizar no banco (não bloqueia se falhar)
          try {
            const hash = await bcrypt.hash(password, 12);
            await prisma.user.upsert({
              where: { email: BOOTSTRAP_ADMIN.email },
              update: {
                name: BOOTSTRAP_ADMIN.name,
                passwordHash: hash,
                role: "ADMIN",
              },
              create: {
                email: BOOTSTRAP_ADMIN.email,
                name: BOOTSTRAP_ADMIN.name,
                passwordHash: hash,
                role: "ADMIN",
              },
            });
          } catch {
            // banco indisponível — login bootstrap continua
          }

          return {
            id: BOOTSTRAP_ADMIN.id,
            email: BOOTSTRAP_ADMIN.email,
            name: BOOTSTRAP_ADMIN.name,
            role: BOOTSTRAP_ADMIN.role,
            empresaId: null,
            clinicaId: null,
          };
        }

        // 2) Usuários no banco
        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user?.passwordHash) return null;

          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            empresaId: user.empresaId,
            clinicaId: user.clinicaId,
          };
        } catch (err) {
          console.error("[auth] authorize error:", err);
          return null;
        }
      },
    }),
  ],
});
