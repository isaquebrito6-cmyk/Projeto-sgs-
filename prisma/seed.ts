import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@sgs.com.br" },
    update: {},
    create: {
      email: "admin@sgs.com.br",
      name: "Administrador SGS",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("✅ Usuário admin criado:");
  console.log("   E-mail: admin@sgs.com.br");
  console.log("   Senha:  admin123");
  console.log("   ID:", admin.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
