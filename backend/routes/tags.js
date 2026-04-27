const express = require('express');
const db = require('../db.js');
const router = express.Router();

router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT name FROM tags ORDER BY name');
  res.json(rows.map(r => r.name));
});

module.exports = router;