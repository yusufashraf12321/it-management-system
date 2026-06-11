const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('employee123', 10);
  await prisma.user.update({
    where: { personalEmail: 'employee@konecta.com' },
    data: { password: hashedPassword }
  });
  console.log('Password for employee@konecta.com has been reset to: employee123');
}

main().finally(() => prisma.$disconnect());
