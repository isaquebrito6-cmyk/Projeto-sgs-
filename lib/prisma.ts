import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Remove parâmetros que quebram Prisma no Neon (ex.: channel_binding) */
export function normalizeDatabaseUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  let u = url.trim();
  u = u.replace(/&channel_binding=require/gi, "");
  u = u.replace(/\?channel_binding=require&/gi, "?");
  u = u.replace(/\?channel_binding=require$/gi, "");
  // Garante sslmode se for Neon/Postgres e não tiver
  if (u.startsWith("postgresql") && !u.includes("sslmode=")) {
    u += u.includes("?") ? "&sslmode=require" : "?sslmode=require";
  }
  return u;
}

const dbUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

function createClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Testa se o banco responde */
export async function testDatabase(): Promise<{ ok: boolean; message: string }> {
  if (!process.env.DATABASE_URL) {
    return { ok: false, message: "DATABASE_URL não definida nas variáveis da Vercel" };
  }
  if (!process.env.DATABASE_URL.includes("postgresql")) {
    return { ok: false, message: "DATABASE_URL precisa ser Postgres (postgresql://...)" };
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, message: "Conectado" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[testDatabase]", msg);
    return { ok: false, message: msg.slice(0, 180) };
  }
}
