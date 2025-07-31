const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
require('./deploy'); // ✅ this will run on Render startup

const bankUploadRoutes = require('./bankUpload');
const compareRoutes = require('./routes/compare');
const ledgerRoutes = require('./routes/ledger');
const checkEmails = require('./emailReader'); // ✅ Import the email reader

console.log('🧪 Script started');
console.log('📦 Modules imported');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5050;

console.log('🔧 Middleware registering...');
app.use(cors());
app.use(express.json());
app.use(bankUploadRoutes);
app.use('/', compareRoutes);
app.use(ledgerRoutes);

app.get('/', (req, res) => {
  console.log('📥 GET / hit');
  res.send('Backend is running!');
});

app.get('/ledger', async (req, res) => {
  try {
    console.log('📥 GET /ledger hit');
    const entries = await prisma.ledger.findMany();
    res.json(entries);
  } catch (err) {
    console.error('❌ Ledger fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch ledger entries' });
  }
});

// ✅ Call email reader function at startup
checkEmails();

try {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
} catch (err) {
  console.error('❌ Server failed to start:', err);
}
