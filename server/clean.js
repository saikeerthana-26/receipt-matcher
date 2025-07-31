const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeDuplicates() {
  await prisma.$executeRawUnsafe(`
    DELETE FROM "Ledger"
    WHERE id NOT IN (
      SELECT MIN(id)
      FROM "Ledger"
      GROUP BY date, amount, description, source
    );
  `);
  console.log("✅ Duplicates removed.");
  await prisma.$disconnect();
}

removeDuplicates();
