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

// uid -> { id, email, name, at }. Saves a database write on every request;
// the row is refreshed when the profile changes or the entry is 10 minutes old.
const USER_CACHE_TTL_MS = 10 * 60 * 1000;
const USER_CACHE_MAX = 5000;
const userCache = new Map();

async function userIdFor(decoded, now = Date.now(), upsert = upsertUser) {
  const email = decoded.email || null;
  const name = decoded.name || null;
  const hit = userCache.get(decoded.uid);
  if (hit && hit.email === email && hit.name === name && now - hit.at < USER_CACHE_TTL_MS) {
    return hit.id;
  }
  const id = await upsert(decoded.uid, email, name);
  if (userCache.size >= USER_CACHE_MAX) userCache.clear();
  userCache.set(decoded.uid, { id, email, name, at: now });
  return id;
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

  // Step 1: who is this? A bad or expired token is the only reason for 401.
  let decoded;
  try {
    const admin = require('../firebase.js');
    decoded = await admin.auth().verifyIdToken(token);
  } catch (err) {
    console.error('[auth] verifyIdToken failed:', err?.code, err?.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Step 2: find or create the user row. A database problem here is a server
  // error: answering 401 would sign every user out during an outage.
  try {
    req.userId = await userIdFor(decoded);
  } catch (err) {
    console.error('[auth] user lookup failed:', err?.code, err?.message);
    return res.status(503).json({ error: 'Service temporarily unavailable' });
  }
  next();
}

module.exports = auth;
module.exports.userIdFor = userIdFor;
module.exports.userCache = userCache;
