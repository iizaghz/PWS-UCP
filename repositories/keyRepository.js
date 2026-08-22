const db = require('../config/db');

async function findByHash(keyHash) {
  const isPg = db.getIsConnected();
  if (isPg) {
    const res = await db.query(`SELECT * FROM api_keys WHERE key_hash = $1 LIMIT 1;`, [keyHash]);
    return res.rows[0] || null;
  }
  return db.memoryDb.api_keys.find(k => k.key_hash === keyHash) || null;
}

async function findByUserId(userId) {
  const isPg = db.getIsConnected();
  if (isPg) {
    const res = await db.query(
      `SELECT id, user_id, name, key_prefix, environment, is_active, expires_at, last_used_at, created_at
       FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC;`,
      [userId]
    );
    return res.rows;
  }
  return db.memoryDb.api_keys.filter(k => k.user_id === parseInt(userId));
}

async function findByIdAndUserId(keyId, userId) {
  const isPg = db.getIsConnected();
  if (isPg) {
    const res = await db.query(
      `SELECT id, user_id, name, key_prefix, environment, is_active, expires_at, last_used_at, created_at
       FROM api_keys WHERE id = $1 AND user_id = $2 LIMIT 1;`,
      [keyId, userId]
    );
    return res.rows[0] || null;
  }
  return db.memoryDb.api_keys.find(k => k.id === parseInt(keyId) && k.user_id === parseInt(userId)) || null;
}

async function create({ userId, name, prefix, keyHash, environment, expiresAt }) {
  const isPg = db.getIsConnected();
  if (isPg) {
    const res = await db.query(
      `INSERT INTO api_keys (user_id, name, key_prefix, key_hash, environment, is_active, expires_at)
       VALUES ($1, $2, $3, $4, $5, true, $6)
       RETURNING id, user_id, name, key_prefix, environment, is_active, expires_at, created_at;`,
      [userId, name, prefix, keyHash, environment, expiresAt]
    );
    return res.rows[0];
  }
  const keyObj = {
    id: db.memoryDb.autoIds.api_keys++,
    user_id: userId,
    name,
    key_prefix: prefix,
    key_hash: keyHash,
    environment,
    is_active: true,
    expires_at: expiresAt,
    last_used_at: null,
    created_at: new Date()
  };
  db.memoryDb.api_keys.push(keyObj);
  return keyObj;
}

async function revoke(keyId) {
  const isPg = db.getIsConnected();
  if (isPg) {
    await db.query(`UPDATE api_keys SET is_active = false WHERE id = $1;`, [keyId]);
  } else {
    const k = db.memoryDb.api_keys.find(x => x.id === parseInt(keyId));
    if (k) k.is_active = false;
  }
}

async function deleteById(keyId) {
  const isPg = db.getIsConnected();
  if (isPg) {
    await db.query(`DELETE FROM api_keys WHERE id = $1;`, [keyId]);
  } else {
    const idx = db.memoryDb.api_keys.findIndex(x => x.id === parseInt(keyId));
    if (idx !== -1) db.memoryDb.api_keys.splice(idx, 1);
  }
}

module.exports = {
  findByHash,
  findByUserId,
  findByIdAndUserId,
  create,
  revoke,
  deleteById
};
