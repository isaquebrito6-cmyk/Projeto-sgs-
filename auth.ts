import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
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
    role: Role;
    empresaId?: string | null;
    clinicaId?: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          empresaId: user.empresaId,
          clinicaId: user.clinicaId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.empresaId = user.empresaId;
        token.clinicaId = user.clinicaId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role;
        session.user.empresaId = token.empresaId;
        session.user.clinicaId = token.clinicaId;
      }
      return session;
    },
  },
});
