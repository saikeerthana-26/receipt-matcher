const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

router.post('/upload-bank', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      fs.unlinkSync(filePath);

      try {
        const parsed = results.map((r) => ({
          date: new Date(r.Date),
          description: r.Description,
          amount: parseFloat(r.Amount),
        }));

        // 🔥 Clear previous bank transactions
        await prisma.bankTransaction.deleteMany();

        // Insert new data
        await prisma.bankTransaction.createMany({
          data: parsed,
          skipDuplicates: true, // Optional
        });

        res.json({ success: true, inserted: parsed.length });
      } catch (err) {
        console.error('DB insert error:', err);
        res.status(500).json({ success: false, error: 'Failed to store transactions.' });
      }
    })
    .on('error', (err) => {
      console.error('CSV parsing error:', err);
      res.status(500).json({ success: false, error: 'Failed to parse CSV.' });
    });
});

router.get('/bank-transactions', async (req, res) => {
  const transactions = await prisma.bankTransaction.findMany({
    orderBy: { date: 'desc' },
  });
  res.json(transactions);
});

module.exports = router;
