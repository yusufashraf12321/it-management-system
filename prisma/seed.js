const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Production Database Initialization...');

  const adminPass = await bcrypt.hash('ahmed', 10);

  // 1. Create Default Department
  console.log('🏢 Creating Default IT Department...');
  const deptIT = await prisma.department.upsert({
    where: { name: 'IT Operations' },
    update: {},
    create: { name: 'IT Operations', description: 'Central IT Management' }
  });

  // 2. Create Default Admin User
  console.log('👑 Creating Master Admin Account...');
  await prisma.user.upsert({
    where: { personalEmail: 'ahmed.konecta@konecta.com' },
    update: { password: adminPass },
    create: {
      fullName: 'System Administrator',
      jobTitle: 'IT Director',
      personalEmail: 'ahmed.konecta@konecta.com',
      contactNo: '+20000000000',
      hiringDate: new Date(),
      konectaMail: 'ahmed.konecta@konecta.com',
      password: adminPass,
      role: 'ADMIN',
      departmentId: deptIT.id
    },
  });

  const empPass = await bcrypt.hash('employee', 10);

  console.log('👤 Creating Employee Account...');
  await prisma.user.upsert({
    where: { personalEmail: 'employee@konecta.com' },
    update: { password: empPass },
    create: {
      fullName: 'Yousef Employee',
      jobTitle: 'Staff',
      personalEmail: 'employee@konecta.com',
      contactNo: '+20000000001',
      hiringDate: new Date(),
      konectaMail: 'employee@konecta.com',
      password: empPass,
      role: 'EMPLOYEE',
      departmentId: deptIT.id
    },
  });

  const employeeUser = await prisma.user.findUnique({ where: { personalEmail: 'employee@konecta.com' } });

  console.log('📦 Creating Basic Inventory and Assets for Employee...');
  const catLaptops = await prisma.category.upsert({ where: { name: 'LAPTOPS' }, update: {}, create: { name: 'LAPTOPS' } });
  
  const invMacBook = await prisma.inventoryItem.upsert({
    where: { category_brand_model: { category: 'LAPTOPS', brand: 'Apple', model: 'MacBook Air M2' } },
    update: {},
    create: { category: 'LAPTOPS', brand: 'Apple', model: 'MacBook Air M2', totalCount: 1, availableCount: 0 }
  });

  await prisma.asset.upsert({
    where: { serialNumber: 'MAC-AIR-001' },
    update: {},
    create: {
      serialNumber: 'MAC-AIR-001',
      price: 1200.00,
      status: 'IN_USE',
      inventoryItemId: invMacBook.id,
      assignedToUserId: employeeUser.id,
      departmentId: deptIT.id,
      assignedDate: new Date()
    }
  });

  console.log('🎫 Creating Basic Ticket for Employee...');
  await prisma.ticket.upsert({
    where: { recNumber: 'REC-0001' },
    update: {},
    create: {
      recNumber: 'REC-0001',
      status: 'OPEN',
      requesterName: employeeUser.fullName,
      email: employeeUser.personalEmail,
      priority: 'MEDIUM',
      issueImpact: 'Need a software license for Photoshop.',
      requesterId: employeeUser.id
    }
  });


  console.log('✅ Database Initialization Complete (Clean State)!');
  console.log('--------------------------------------------------');
  console.log('🔑 ACCOUNTS:');
  console.log('Admin:    ahmed.konecta@konecta.com  | Pass: ahmed');
  console.log('Employee: employee@konecta.com       | Pass: employee');
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
