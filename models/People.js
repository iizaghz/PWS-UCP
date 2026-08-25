const db = require('../config/db');

class People {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name;
    this.profile_url = data.profile_url;
    this.biography = data.biography;
    this.birth_date = data.birth_date;
    this.birth_place = data.birth_place;
  }

  static async findAll({ page = 1, limit = 10, search } = {}) {
    const isPg = db.getIsConnected();
    const offset = (page - 1) * limit;

    if (isPg) {
      let whereClause = '';
      let params = [];
      if (search) {
        whereClause = 'WHERE name ILIKE $1';
        params.push(`%${search}%`);
      }
      const countRes = await db.query(`SELECT COUNT(*) FROM people ${whereClause};`, params);
      const total = parseInt(countRes.rows[0].count);

      const limitIdx = params.length + 1;
      const offsetIdx = params.length + 2;
      const query = `SELECT * FROM people ${whereClause} ORDER BY name ASC LIMIT $${limitIdx} OFFSET $${offsetIdx};`;
      params.push(limit, offset);

      const res = await db.query(query, params);
      return {
        people: res.rows.map(p => new People(p)),
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(total / limit)
      };
    }

    let list = [...db.memoryDb.people];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(s));
    }
    const total = list.length;
    const paginated = list.slice(offset, offset + limit).map(p => new People(p));
    return {
      people: paginated,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(total / limit)
    };
  }

  static async findById(id) {
    const isPg = db.getIsConnected();
    if (isPg) {
      const res = await db.query(`SELECT * FROM people WHERE id = $1 LIMIT 1;`, [id]);
      return res.rows[0] ? new People(res.rows[0]) : null;
    }
    const p = db.memoryDb.people.find(x => x.id === parseInt(id));
    return p ? new People(p) : null;
  }
}

module.exports = People;
