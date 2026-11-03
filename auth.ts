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
    claimsCheckedAt?: number;
  }
}

const IS_PROD = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

/** Bootstrap só se explicitamente habilitado (ou em dev). Em produção prefira usuário no banco. */
const BOOTSTRAP_ENABLED =
  process.env.BOOTSTRAP_ADMIN === "1" ||
  process.env.BOOTSTRAP_ADMIN === "true" ||
  !IS_PROD;

const BOOTSTRAP_ADMIN = {
  email: (process.env.BOOTSTRAP_EMAIL || "isaquebrito6@gmail.com").trim().toLowerCase(),
  name: process.env.BOOTSTRAP_NAME || "Isaque Brito",
  password: process.env.BOOTSTRAP_PASSWORD || "Admin@SGS2026",
  role: "ADMIN" as Role,
};

const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (IS_PROD ? undefined : "sgs-dev-secret-apenas-local");

if (IS_PROD && !authSecret) {
  console.error("[auth] AUTH_SECRET não definido em produção.");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: authSecret,
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

        // Rejeita senhas vazias / muito curtas
        if (password.length < 6) return null;

        // 1) Usuário no banco (preferencial)
        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (user?.passwordHash) {
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
          }
        } catch (err) {
          console.error("[auth] authorize db error:", err);
        }

        // 2) Bootstrap admin (somente se habilitado e senha bater)
        if (
          BOOTSTRAP_ENABLED &&
          email === BOOTSTRAP_ADMIN.email &&
          password === BOOTSTRAP_ADMIN.password
        ) {
          try {
            const hash = await bcrypt.hash(password, 12);
            const upserted = await prisma.user.upsert({
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
            return {
              id: upserted.id,
              email: upserted.email,
              name: upserted.name,
              role: "ADMIN" as Role,
              empresaId: null,
              clinicaId: null,
            };
          } catch {
            // Banco fora — permite sessão bootstrap só com id estável
            return {
              id: "bootstrap-admin",
              email: BOOTSTRAP_ADMIN.email,
              name: BOOTSTRAP_ADMIN.name,
              role: BOOTSTRAP_ADMIN.role,
              empresaId: null,
              clinicaId: null,
            };
          }
        }

        return null;
      },
    }),
  ],
});
