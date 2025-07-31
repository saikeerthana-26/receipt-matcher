const bankUploadRoutes = require('./bankUpload');
const compareRoutes = require('./routes/compare');


require('dotenv').config();

console.log('🧪 Script started');

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

console.log('📦 Modules imported');

const app = express();
const prisma = new PrismaClient();
const PORT = 5050;

console.log('🔧 Middleware registering...');
app.use(cors());
app.use(express.json());
app.use(bankUploadRoutes);
app.use('/',compareRoutes);
app.use(require('./routes/ledger'));


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

try {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
} catch (err) {
  console.error('Server failed to start:', err);
}
