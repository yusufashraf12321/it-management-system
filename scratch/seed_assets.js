const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Mock Assets for Testing...');

  // Find Youssef's user account
  const user = await prisma.user.findFirst({
    where: { personalEmail: 'youssef@konecta.com' },
    include: { department: true }
  });

  if (!user) {
    console.error('❌ User Youssef Ashraf not found. Please run seed.js first.');
    return;
  }

  console.log(`👤 Found user: ${user.fullName} (ID: ${user.id}, Department ID: ${user.departmentId})`);

  // 1. Create or Find Inventory Items
  const laptopItem = await prisma.inventoryItem.upsert({
    where: { category_brand_model: { category: 'Laptop', brand: 'Dell', model: 'Latitude 5420' } },
    update: {},
    create: {
      category: 'Laptop',
      brand: 'Dell',
      model: 'Latitude 5420',
      totalCount: 5,
      availableCount: 4
    }
  });

  const monitorItem = await prisma.inventoryItem.upsert({
    where: { category_brand_model: { category: 'Monitor', brand: 'Dell', model: 'P2419H' } },
    update: {},
    create: {
      category: 'Monitor',
      brand: 'Dell',
      model: 'P2419H',
      totalCount: 3,
      availableCount: 2
    }
  });

  // 2. Create and Assign Assets
  await prisma.asset.upsert({
    where: { serialNumber: 'DELL-LAP-98765' },
    update: {
      assignedToUserId: user.id,
      departmentId: user.departmentId,
      status: 'ASSIGNED',
      assignedDate: new Date()
    },
    create: {
      serialNumber: 'DELL-LAP-98765',
      status: 'ASSIGNED',
      price: 1200,
      inventoryItemId: laptopItem.id,
      assignedToUserId: user.id,
      departmentId: user.departmentId,
      assignedDate: new Date()
    }
  });

  await prisma.asset.upsert({
    where: { serialNumber: 'DELL-MON-43210' },
    update: {
      assignedToUserId: user.id,
      departmentId: user.departmentId,
      status: 'ASSIGNED',
      assignedDate: new Date()
    },
    create: {
      serialNumber: 'DELL-MON-43210',
      status: 'ASSIGNED',
      price: 300,
      inventoryItemId: monitorItem.id,
      assignedToUserId: user.id,
      departmentId: user.departmentId,
      assignedDate: new Date()
    }
  });

  console.log('✅ Seeding Mock Assets Complete! Assigned DELL-LAP-98765 and DELL-MON-43210 to Youssef.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
