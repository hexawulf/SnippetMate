const express = require('express');
const db = require('../db.js');
const router = express.Router();

// Liveness: the process answers. Used by monitors; never touches the database.
router.get('/', (req, res) => {
  res.json({ ok: true });
});

// Readiness: the database answers too.
router.get('/db', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ ok: true, db: true });
  } catch (err) {
    console.error('[health] database check failed:', err?.code, err?.message);
    res.status(503).json({ ok: false, db: false });
  }
});

module.exports = router;
