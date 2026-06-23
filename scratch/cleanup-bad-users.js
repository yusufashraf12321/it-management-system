const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find users with commas in their names or placeholder emails
  const badUsers = await prisma.user.findMany({
    where: {
      OR: [
        { fullName: { contains: ',' } },
        { personalEmail: { contains: 'placeholder' } },
        { konectaMail: { contains: 'placeholder' } }
      ]
    }
  });

  console.log(`Found ${badUsers.length} corrupted users to delete.`);

  for (const user of badUsers) {
    // Delete any associated assets/records if any (though they should have 0)
    await prisma.user.delete({
      where: { id: user.id }
    });
    console.log(`Deleted: ${user.fullName}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
