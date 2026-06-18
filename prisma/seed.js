const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Initialization...');

  // 0. Clean the DB (Delete all old data to start fresh)
  console.log('🗑️ Deleting all existing accounts and related data...');
  await prisma.maintenance.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});

  const adminPass = await bcrypt.hash('admin123', 10);

  // 1. Create Default Department
  console.log('🏢 Creating Default IT Department...');
  const deptIT = await prisma.department.create({
    data: { name: 'IT Operations', description: 'Central IT Management' }
  });

  // 2. Create the 3 Admin Users
  console.log('👑 Creating Admin Accounts...');
  
  const admins = [
    { name: 'Youssef Ashraf', email: 'youssef@konecta.com' },
    { name: 'Mohamed Gabry', email: 'mohamed@konecta.com' },
    { name: 'Abdelrahman Tarek', email: 'abdelrahman@konecta.com' }
  ];

  for (const admin of admins) {
    await prisma.user.create({
      data: {
        fullName: admin.name,
        jobTitle: 'IT Admin',
        personalEmail: admin.email,
        contactNo: '+20000000000',
        hiringDate: new Date(),
        konectaMail: admin.email,
        password: adminPass,
        role: 'ADMIN',
        departmentId: deptIT.id
      }
    });
  }

  console.log('✅ Database Initialization Complete!');
  console.log('--------------------------------------------------');
  console.log('🔑 NEW ADMIN ACCOUNTS CREATED:');
  console.log('Password for all accounts is: admin123');
  admins.forEach(a => console.log(`- Email: ${a.email}`));
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
