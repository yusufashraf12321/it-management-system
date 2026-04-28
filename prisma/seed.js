const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create Departments
  const deptIT = await prisma.department.upsert({
    where: { name: 'Information Technology' },
    update: {},
    create: { name: 'Information Technology', description: 'IT Support and Infrastructure' },
  });

  const deptHR = await prisma.department.upsert({
    where: { name: 'Human Resources' },
    update: {},
    create: { name: 'Human Resources', description: 'HR and Recruitment' },
  });

  const deptFinance = await prisma.department.upsert({
    where: { name: 'Finance' },
    update: {},
    create: { name: 'Finance', description: 'Accounting and Finance' },
  });

  // Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { personalEmail: 'admin@company.com' },
    update: {},
    create: {
      fullName: 'System Admin',
      jobTitle: 'IT Manager',
      personalEmail: 'admin@company.com',
      contactNo: '01000000000',
      hiringDate: new Date('2020-01-01'),
      konectaMail: 'admin.konecta@company.com',
      role: 'ADMIN',
      password: adminPassword,
      departmentId: deptIT.id,
    },
  });

  const employeePassword = await bcrypt.hash('emp123', 10);
  const emp1 = await prisma.user.upsert({
    where: { personalEmail: 'ahmed.m@company.com' },
    update: {},
    create: {
      fullName: 'Ahmed Mahmoud',
      jobTitle: 'HR Specialist',
      personalEmail: 'ahmed.m@company.com',
      contactNo: '01111111111',
      hiringDate: new Date('2022-03-15'),
      reportingTo: 'HR Manager',
      konectaMail: 'ahmed.konecta@company.com',
      role: 'EMPLOYEE',
      password: employeePassword,
      departmentId: deptHR.id,
    },
  });

  const emp2 = await prisma.user.upsert({
    where: { personalEmail: 'sara.k@company.com' },
    update: {},
    create: {
      fullName: 'Sara Khaled',
      jobTitle: 'Financial Analyst',
      personalEmail: 'sara.k@company.com',
      contactNo: '01222222222',
      hiringDate: new Date('2023-06-01'),
      reportingTo: 'CFO',
      konectaMail: 'sara.konecta@company.com',
      role: 'EMPLOYEE',
      password: employeePassword,
      departmentId: deptFinance.id,
    },
  });

  // Create Inventory Items
  const laptopModelX = await prisma.inventoryItem.upsert({
    where: {
      category_brand_model: {
        category: 'Laptop',
        brand: 'Dell',
        model: 'Latitude 5540'
      }
    },
    update: {},
    create: {
      category: 'Laptop',
      brand: 'Dell',
      model: 'Latitude 5540',
      totalCount: 50,
      availableCount: 49,
    },
  });

  const laptopModelZ = await prisma.inventoryItem.upsert({
    where: {
      category_brand_model: {
        category: 'Laptop',
        brand: 'HP',
        model: 'ProBook 450'
      }
    },
    update: {},
    create: {
      category: 'Laptop',
      brand: 'HP',
      model: 'ProBook 450',
      totalCount: 50,
      availableCount: 50,
    },
  });

  // Create Assets
  const asset1 = await prisma.asset.upsert({
    where: { serialNumber: 'SN-DELL-001' },
    update: {},
    create: {
      serialNumber: 'SN-DELL-001',
      status: 'ASSIGNED',
      inventoryItemId: laptopModelX.id,
      assignedToUserId: emp1.id,
      departmentId: deptHR.id,
      assignedDate: new Date(),
    },
  });

  // Add remaining 49 available assets for Dell
  for (let i = 2; i <= 50; i++) {
    const sn = `SN-DELL-${i.toString().padStart(3, '0')}`;
    await prisma.asset.upsert({
      where: { serialNumber: sn },
      update: {},
      create: {
        serialNumber: sn,
        status: 'IN_STOCK',
        inventoryItemId: laptopModelX.id,
      },
    });
  }

  // Add 50 available assets for HP
  for (let i = 1; i <= 50; i++) {
    const sn = `SN-HP-${i.toString().padStart(3, '0')}`;
    await prisma.asset.upsert({
      where: { serialNumber: sn },
      update: {},
      create: {
        serialNumber: sn,
        status: 'IN_STOCK',
        inventoryItemId: laptopModelZ.id,
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
