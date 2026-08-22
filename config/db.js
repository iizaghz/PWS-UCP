const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

let pool = null;
let isConnected = false;

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: connectionString.includes('supabase') || connectionString.includes('sslmode=require') || process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false
  });
}

// In-Memory Fallback Storage if PG is not reachable in local dev without env setup
const memoryDb = {
  users: [],
  api_keys: [],
  movies: [],
  genres: [],
  movie_genres: [],
  people: [],
  movie_cast: [],
  movie_crew: [],
  production_companies: [],
  movie_companies: [],
  reviews: [],
  api_usage: [],
  autoIds: {
    users: 1,
    api_keys: 1,
    movies: 1,
    genres: 1,
    people: 1,
    movie_cast: 1,
    movie_crew: 1,
    production_companies: 1,
    reviews: 1,
    api_usage: 1
  }
};

async function testConnection() {
  if (!pool) return false;
  try {
    const client = await pool.connect();
    client.release();
    isConnected = true;
    console.log('[Database] Successfully connected to PostgreSQL / Supabase!');
    return true;
  } catch (err) {
    console.warn('[Database] PostgreSQL connection failed/not configured. Falling back to internal state engine:', err.message);
    isConnected = false;
    return false;
  }
}

async function initDb() {
  const connected = await testConnection();
  if (connected) {
    try {
      const schemaSql = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
      await pool.query(schemaSql);
      console.log('[Database] PostgreSQL schema initialized successfully.');
    } catch (err) {
      console.error('[Database] Error initializing PostgreSQL schema:', err.message);
    }
  } else {
    console.log('[Database] Initialized in-memory fallback database engine.');
  }

  // Ensure default demo user izaya@gmail.com exists in memory fallback
  if (memoryDb.users.length === 0) {
    const bcrypt = require('bcryptjs');
    const passHash = bcrypt.hashSync('123456', 10);
    memoryDb.users.push({
      id: 1,
      name: 'Demo Developer',
      email: 'izaya@gmail.com',
      password_hash: passHash,
      created_at: new Date()
    });
    memoryDb.autoIds.users = 2;
  }
}

async function query(text, params = []) {
  if (isConnected && pool) {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (err) {
      console.error('[Database] Query Error:', err.message, text);
      throw err;
    }
  }

  // Pure JavaScript SQL query simulation fallback for development without PG database setup
  return simulateMemoryQuery(text, params);
}

function simulateMemoryQuery(text, params = []) {
  const sql = text.trim();
  const lowerSql = sql.toLowerCase();

  // SELECT queries
  if (lowerSql.startsWith('select')) {
    if (lowerSql.includes('from users')) {
      let filtered = [...memoryDb.users];
      if (lowerSql.includes('email')) {
        filtered = filtered.filter(u => u.email.toLowerCase() === (params[0] || '').toString().trim().toLowerCase());
      } else if (lowerSql.includes('where id = $1')) {
        filtered = filtered.filter(u => u.id === parseInt(params[0]));
      }
      return { rows: filtered, rowCount: filtered.length };
    }

    if (lowerSql.includes('from api_keys')) {
      let filtered = [...memoryDb.api_keys];
      if (lowerSql.includes('where key_hash = $1')) {
        filtered = filtered.filter(k => k.key_hash === params[0]);
      } else if (lowerSql.includes('where user_id = $1')) {
        filtered = filtered.filter(k => k.user_id === parseInt(params[0]));
      } else if (lowerSql.includes('where id = $1')) {
        filtered = filtered.filter(k => k.id === parseInt(params[0]));
      }
      return { rows: filtered, rowCount: filtered.length };
    }

    if (lowerSql.includes('from genres')) {
      let filtered = [...memoryDb.genres];
      if (lowerSql.includes('where id = $1')) {
        filtered = filtered.filter(g => g.id === parseInt(params[0]));
      }
      return { rows: filtered, rowCount: filtered.length };
    }

    if (lowerSql.includes('from people')) {
      let filtered = [...memoryDb.people];
      if (lowerSql.includes('where id = $1')) {
        filtered = filtered.filter(p => p.id === parseInt(params[0]));
      }
      return { rows: filtered, rowCount: filtered.length };
    }

    if (lowerSql.includes('from production_companies')) {
      let filtered = [...memoryDb.production_companies];
      return { rows: filtered, rowCount: filtered.length };
    }

    if (lowerSql.includes('from movies')) {
      let filtered = [...memoryDb.movies];
      if (lowerSql.includes('where id = $1') || lowerSql.includes('m.id = $1')) {
        filtered = filtered.filter(m => m.id === parseInt(params[0]));
      } else if (lowerSql.includes('where slug = $1') || lowerSql.includes('m.slug = $1')) {
        filtered = filtered.filter(m => m.slug === params[0]);
      }
      return { rows: filtered, rowCount: filtered.length };
    }

    if (lowerSql.includes('from reviews')) {
      let filtered = [...memoryDb.reviews];
      if (lowerSql.includes('where movie_id = $1')) {
        filtered = filtered.filter(r => r.movie_id === parseInt(params[0]));
      }
      return { rows: filtered, rowCount: filtered.length };
    }

    if (lowerSql.includes('from api_usage')) {
      let filtered = [...memoryDb.api_usage];
      if (lowerSql.includes('where api_key_id = $1')) {
        filtered = filtered.filter(u => u.api_key_id === parseInt(params[0]));
      }
      return { rows: filtered, rowCount: filtered.length };
    }
  }

  // INSERT queries
  if (lowerSql.startsWith('insert into users')) {
    const user = {
      id: memoryDb.autoIds.users++,
      name: params[0],
      email: params[1],
      password_hash: params[2],
      created_at: new Date(),
      updated_at: new Date()
    };
    memoryDb.users.push(user);
    return { rows: [user], rowCount: 1 };
  }

  if (lowerSql.startsWith('insert into api_keys')) {
    const keyObj = {
      id: memoryDb.autoIds.api_keys++,
      user_id: params[0],
      name: params[1],
      key_prefix: params[2],
      key_hash: params[3],
      environment: params[4] || 'live',
      is_active: params[5] !== undefined ? params[5] : true,
      expires_at: params[6] || null,
      last_used_at: null,
      created_at: new Date()
    };
    memoryDb.api_keys.push(keyObj);
    return { rows: [keyObj], rowCount: 1 };
  }

  if (lowerSql.startsWith('insert into api_usage')) {
    const usage = {
      id: memoryDb.autoIds.api_usage++,
      api_key_id: params[0],
      endpoint: params[1],
      method: params[2],
      status_code: params[3],
      response_time: params[4],
      ip_address: params[5],
      user_agent: params[6],
      requested_at: new Date()
    };
    memoryDb.api_usage.push(usage);
    return { rows: [usage], rowCount: 1 };
  }

  // UPDATE queries
  if (lowerSql.startsWith('update api_keys')) {
    if (lowerSql.includes('is_active = false')) {
      const key = memoryDb.api_keys.find(k => k.id === parseInt(params[0]));
      if (key) key.is_active = false;
      return { rows: key ? [key] : [], rowCount: key ? 1 : 0 };
    }
    if (lowerSql.includes('last_used_at')) {
      const key = memoryDb.api_keys.find(k => k.id === parseInt(params[1]));
      if (key) key.last_used_at = params[0];
      return { rows: key ? [key] : [], rowCount: key ? 1 : 0 };
    }
  }

  // DELETE queries
  if (lowerSql.startsWith('delete from api_keys')) {
    const idx = memoryDb.api_keys.findIndex(k => k.id === parseInt(params[0]));
    if (idx !== -1) {
      memoryDb.api_keys.splice(idx, 1);
      return { rowCount: 1 };
    }
    return { rowCount: 0 };
  }

  return { rows: [], rowCount: 0 };
}

module.exports = {
  pool,
  query,
  initDb,
  getIsConnected: () => isConnected,
  memoryDb
};
