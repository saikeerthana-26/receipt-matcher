const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all ledger entries
router.get('/ledger', async (req, res) => {
  const entries = await prisma.ledger.findMany({ orderBy: { date: 'desc' } });
  res.json(entries);
});

// Delete one ledger entry by ID
router.delete('/ledger/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.ledger.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete ledger entry.' });
  }
});

module.exports = router;
