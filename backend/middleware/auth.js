'use strict';
const db = require('../db.js');

// Evaluated once at module load — no request path can mutate a const.
const IS_TEST = process.env.NODE_ENV === 'test';

async function upsertUser(uid, email, name) {
  const [result] = await db.query(
    `INSERT INTO users (firebase_uid, email, display_name) VALUES (?,?,?)
     ON DUPLICATE KEY UPDATE email=VALUES(email), display_name=VALUES(display_name),
     id=LAST_INSERT_ID(id)`,
    [uid, email || null, name || null]
  );
  return result.insertId;
}

async function auth(req, res, next) {
  // Test-mode shim: activated by IS_TEST, which is frozen at process start.
  // Cannot be triggered by any request header or input.
  if (IS_TEST) {
    const authHeader = req.headers.authorization;
    if (authHeader === 'Bearer none') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const uid = authHeader === 'Bearer user2' ? 'seed-demo-2' : 'seed-demo';
    req.userId = await upsertUser(uid, uid + '@snippetmate.local', uid === 'seed-demo' ? 'Seed Demo' : 'Seed Demo 2');
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.slice(7);

  try {
    const admin = require('../firebase.js');
    const decoded = await admin.auth().verifyIdToken(token);
    req.userId = await upsertUser(decoded.uid, decoded.email, decoded.name);
    next();
  } catch (err) {
    console.error('[auth] verifyIdToken/upsert failed:', err?.code, err?.message, err?.stack);
    res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = auth;
