// deploy.js
const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Applying Prisma migrations...");
  exec('npx prisma migrate deploy', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Migration error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️ Migration stderr: ${stderr}`);
      return;
    }
    console.log(`✅ Migration Output: ${stdout}`);
  });
}

main();
