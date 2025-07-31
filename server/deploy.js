// server/deploy.js
const { exec } = require('child_process');

exec('npx prisma migrate deploy', (err, stdout, stderr) => {
  if (err) {
    console.error('❌ Migration error:', err.message);
    return;
  }
  if (stderr) {
    console.warn('⚠️ Migration warning:', stderr);
  }
  console.log('✅ Migration output:', stdout);
});
