const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.get('/compare', async (req, res) => {
  try {
    const ledger = await prisma.ledger.findMany();
    const bank = await prisma.bankTransaction.findMany();

    const matched = [];
    const onlyInLedger = [];
    const onlyInBank = [...bank]; // clone for safe mutation

    ledger.forEach(led => {
      const matchIndex = onlyInBank.findIndex(b =>
        Math.abs(b.amount - led.amount) < 0.01 &&
        new Date(b.date).toDateString() === new Date(led.date).toDateString()
      );

      if (matchIndex !== -1) {
        matched.push({ ledger: led, bank: onlyInBank[matchIndex] });
        onlyInBank.splice(matchIndex, 1);
      } else {
        onlyInLedger.push(led);
      }
    });

    res.json({ matched, onlyInLedger, onlyInBank });
  } catch (err) {
    console.error('Comparison failed:', err);
    res.status(500).json({ error: 'Comparison failed.' });
  }
});

module.exports = router;
