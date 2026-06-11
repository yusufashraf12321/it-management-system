const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    select: { personalEmail: true, konectaMail: true, fullName: true }
  });
  console.log(JSON.stringify(employees, null, 2));
}

main().finally(() => prisma.$disconnect());
