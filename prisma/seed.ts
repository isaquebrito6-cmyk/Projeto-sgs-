import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@sgs.local" },
    update: {},
    create: {
      email: "admin@sgs.local",
      name: "Administrador SGS",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Usuário admin criado:", admin.email);
  console.log("Senha: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
