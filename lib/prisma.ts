import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: process.env.DATABASE_URL
      ? { db: { url: process.env.DATABASE_URL } }
      : undefined,
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Testa se o banco responde */
export async function testDatabase(): Promise<{ ok: boolean; message: string }> {
  if (!process.env.DATABASE_URL) {
    return { ok: false, message: "DATABASE_URL não definida" };
  }
  if (!process.env.DATABASE_URL.startsWith("postgresql")) {
    return { ok: false, message: "DATABASE_URL precisa começar com postgresql://" };
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, message: "Conectado" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[testDatabase]", msg);
    return { ok: false, message: msg.slice(0, 200) };
  }
}
