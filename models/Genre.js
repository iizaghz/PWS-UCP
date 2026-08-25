const db = require('../config/db');

class Genre {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
  }

  static async findAll() {
    const isPg = db.getIsConnected();
    if (isPg) {
      const res = await db.query(`SELECT * FROM genres ORDER BY name ASC;`);
      return res.rows.map(g => new Genre(g));
    }
    return db.memoryDb.genres.map(g => new Genre(g));
  }

  static async findById(id) {
    const isPg = db.getIsConnected();
    if (isPg) {
      const res = await db.query(`SELECT * FROM genres WHERE id = $1 LIMIT 1;`, [id]);
      return res.rows[0] ? new Genre(res.rows[0]) : null;
    }
    const g = db.memoryDb.genres.find(x => x.id === parseInt(id));
    return g ? new Genre(g) : null;
  }
}

module.exports = Genre;
