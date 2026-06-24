const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Initialization...');

  // 0. Sync the schema first to ensure all tables exist
  console.log('🔄 Syncing database schema...');
  try {
    execSync('node /app/node_modules/prisma/build/index.js db push', {
      env: { ...process.env },
      stdio: 'inherit'
    });
  } catch (e) {
    console.log('Schema sync skipped (may already be up to date).');
  }

  // 1. Clean the DB safely (handle missing tables gracefully)
  console.log('🗑️ Deleting all existing accounts and related data...');
  const tables = ['maintenance', 'ticket', 'asset', 'purchaseOrder', 'inventoryItem', 'category', 'notification', 'activityLog', 'user', 'department'];
  for (const table of tables) {
    try {
      await prisma[table].deleteMany({});
    } catch (e) {
      console.log(`⚠️ Skipped table '${table}' (not found or already empty).`);
    }
  }

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

  // 3. Create Default Inventory Categories
  console.log('📦 Creating Default Inventory Categories...');
  const defaultCategories = [
    {
      name: 'LAPTOPS',
      fields: JSON.stringify(['Gen', 'Processor Core', 'RAM', 'Harddisk', 'MAC Wifi', 'MAC Ethernet', 'Hostname'])
    },
    { name: 'HEADSETS',         fields: JSON.stringify([]) },
    { name: 'SCREENS',          fields: JSON.stringify([]) },
    { name: 'TV',               fields: JSON.stringify([]) },
    { name: 'SOFTWARE_LICENSE', fields: JSON.stringify([]) },
  ];

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
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
