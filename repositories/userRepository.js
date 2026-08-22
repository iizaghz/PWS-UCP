const db = require('../config/db');

async function findByEmail(email) {
  const isPg = db.getIsConnected();
  if (isPg) {
    const res = await db.query(`SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1;`, [email]);
    return res.rows[0] || null;
  }
  return db.memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

async function findById(id) {
  const isPg = db.getIsConnected();
  if (isPg) {
    const res = await db.query(`SELECT id, name, email, created_at FROM users WHERE id = $1 LIMIT 1;`, [id]);
    return res.rows[0] || null;
  }
  const u = db.memoryDb.users.find(x => x.id === parseInt(id));
  return u ? { id: u.id, name: u.name, email: u.email, created_at: u.created_at } : null;
}

async function create({ name, email, password_hash }) {
  const isPg = db.getIsConnected();
  if (isPg) {
    const res = await db.query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at;`,
      [name, email, password_hash]
    );
    return res.rows[0];
  }
  const user = {
    id: db.memoryDb.autoIds.users++,
    name,
    email,
    password_hash,
    created_at: new Date(),
    updated_at: new Date()
  };
  db.memoryDb.users.push(user);
  return user;
}

module.exports = {
  findByEmail,
  findById,
  create
};
