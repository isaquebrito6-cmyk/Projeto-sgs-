import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  const adminPrincipal = await prisma.user.upsert({
    where: { email: "isaquebrito6@gmail.com" },
    update: {
      name: "Isaque Brito",
      passwordHash,
      role: "ADMIN",
    },
    create: {
      email: "isaquebrito6@gmail.com",
      name: "Isaque Brito",
      passwordHash,
      role: "ADMIN",
    },
  });

  const adminDemo = await prisma.user.upsert({
    where: { email: "admin@sgs.local" },
    update: {
      passwordHash,
      role: "ADMIN",
    },
    create: {
      email: "admin@sgs.local",
      name: "Administrador SGS",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin principal:", adminPrincipal.email);
  console.log("Admin demo:", adminDemo.email);
  console.log("Senha padrão: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
