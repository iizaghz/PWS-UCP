const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../config/db');
const seedData = require('./seedData');

async function seed() {
  console.log('[Seed] Starting database seeding...');
  await db.initDb();

  const isPg = db.getIsConnected();

  if (!isPg) {
    console.log('[Seed] Seeding into in-memory engine fallback...');
    // Seed in memory
    const passHash = await bcrypt.hash('12345', 10);
    const demoUser = {
      id: 1,
      name: 'Sukma Hawa Iza Ghazali',
      email: 'izaya@gmail.com',
      password_hash: passHash,
      created_at: new Date(),
      updated_at: new Date()
    };
    db.memoryDb.users = [demoUser];
    db.memoryDb.autoIds.users = 2;

    const rawApiKey = 'cd_live_demo1234567890abcdef';
    const keyHash = crypto.createHash('sha256').update(rawApiKey).digest('hex');

    const demoApiKey = {
      id: 1,
      user_id: 1,
      name: 'Default Production Key',
      key_prefix: 'cd_live_',
      key_hash: keyHash,
      environment: 'live',
      is_active: true,
      expires_at: new Date(Date.now() + 365 * 24 * 3600 * 1000),
      last_used_at: new Date(),
      created_at: new Date()
    };
    db.memoryDb.api_keys = [demoApiKey];
    db.memoryDb.autoIds.api_keys = 2;

    db.memoryDb.genres = seedData.genres;
    db.memoryDb.production_companies = seedData.companies;
    db.memoryDb.people = seedData.people;
    db.memoryDb.movies = seedData.movies;
    db.memoryDb.reviews = seedData.reviews;
    db.memoryDb.api_usage = seedData.apiUsageLogs;
    db.memoryDb.autoIds.movies = seedData.movies.length + 1;
    db.memoryDb.autoIds.genres = seedData.genres.length + 1;
    db.memoryDb.autoIds.people = seedData.people.length + 1;
    db.memoryDb.autoIds.production_companies = seedData.companies.length + 1;
    db.memoryDb.autoIds.reviews = seedData.reviews.length + 1;
    db.memoryDb.autoIds.api_usage = seedData.apiUsageLogs.length + 1;

    console.log(`[Seed] In-memory database populated successfully with:`);
    console.log(`- ${seedData.movies.length} Movies`);
    console.log(`- ${seedData.genres.length} Genres`);
    console.log(`- ${seedData.people.length} People`);
    console.log(`- ${seedData.companies.length} Production Companies`);
    console.log(`- ${seedData.reviews.length} Reviews`);
    console.log(`- ${seedData.apiUsageLogs.length} Usage Logs`);
    console.log(`- Default Demo API Key: cd_live_demo1234567890abcdef`);
    return;
  }

  // Seeding into real PostgreSQL database
  try {
    // 1. Seed Demo User
    const passHash = await bcrypt.hash('12345', 10);
    const userRes = await db.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET name = $1, password_hash = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING id;`,
      ['Sukma Hawa Iza Ghazali', 'izaya@gmail.com', passHash]
    );
    const userId = userRes.rows[0].id;

    // 2. Seed Demo API Key
    const rawApiKey = 'cd_live_demo1234567890abcdef';
    const keyHash = crypto.createHash('sha256').update(rawApiKey).digest('hex');
    
    await db.query(
      `INSERT INTO api_keys (user_id, name, key_prefix, key_hash, environment, is_active, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (key_hash) DO NOTHING;`,
      [userId, 'Default Production Key', 'cd_live_', keyHash, 'live', true, new Date(Date.now() + 365 * 24 * 3600 * 1000)]
    );

    // 3. Seed Genres
    for (const g of seedData.genres) {
      await db.query(
        `INSERT INTO genres (id, name, slug) VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET name = $2, slug = $3;`,
        [g.id, g.name, g.slug]
      );
    }

    // 4. Seed Companies
    for (const c of seedData.companies) {
      await db.query(
        `INSERT INTO production_companies (id, name, country, logo_url) VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET name = $2, country = $3, logo_url = $4;`,
        [c.id, c.name, c.country, c.logo_url]
      );
    }

    // 5. Seed People
    for (const p of seedData.people) {
      await db.query(
        `INSERT INTO people (id, name, profile_url, biography, birth_date, birth_place) VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET name = $2, profile_url = $3, biography = $4;`,
        [p.id, p.name, p.profile_url, p.biography, p.birth_date, p.birth_place]
      );
    }

    // 6. Seed Movies
    for (const m of seedData.movies) {
      await db.query(
        `INSERT INTO movies (id, title, original_title, slug, overview, tagline, release_date, runtime, budget, revenue, popularity, vote_average, vote_count, original_language, status, poster_url, backdrop_url, trailer_url, age_rating)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
         ON CONFLICT (id) DO UPDATE SET title = $2, popularity = $11, vote_average = $12;`,
        [m.id, m.title, m.original_title, m.slug, m.overview, m.tagline, m.release_date, m.runtime, m.budget, m.revenue, m.popularity, m.vote_average, m.vote_count, m.original_language, m.status, m.poster_url, m.backdrop_url, m.trailer_url, m.age_rating]
      );

      // Movie Genres relation
      if (m.genreIds && m.genreIds.length > 0) {
        for (const gId of m.genreIds) {
          await db.query(
            `INSERT INTO movie_genres (movie_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
            [m.id, gId]
          );
        }
      }

      // Movie Companies relation
      const cId = (m.id % seedData.companies.length) + 1;
      await db.query(
        `INSERT INTO movie_companies (movie_id, company_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
        [m.id, cId]
      );

      // Movie Cast relation
      const p1 = (m.id % seedData.people.length) + 1;
      const p2 = ((m.id * 3) % seedData.people.length) + 1;
      await db.query(
        `INSERT INTO movie_cast (movie_id, person_id, character_name, cast_order) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING;`,
        [m.id, p1, 'Lead Character', 1]
      );
      await db.query(
        `INSERT INTO movie_cast (movie_id, person_id, character_name, cast_order) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING;`,
        [m.id, p2, 'Supporting Character', 2]
      );
    }

    // 7. Seed Reviews
    for (const r of seedData.reviews) {
      await db.query(
        `INSERT INTO reviews (id, movie_id, author, rating, content, created_at) VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING;`,
        [r.id, r.movie_id, r.author, r.rating, r.content, r.created_at]
      );
    }

    // 8. Seed API Usage Logs
    const keyRes = await db.query(`SELECT id FROM api_keys LIMIT 1;`);
    const apiKeyId = keyRes.rows.length > 0 ? keyRes.rows[0].id : null;

    for (const log of seedData.apiUsageLogs) {
      await db.query(
        `INSERT INTO api_usage (id, api_key_id, endpoint, method, status_code, response_time, ip_address, user_agent, requested_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING;`,
        [log.id, apiKeyId, log.endpoint, log.method, log.status_code, log.response_time, log.ip_address, log.user_agent, log.requested_at]
      );
    }

    console.log('[Seed] PostgreSQL seeding completed successfully!');
  } catch (err) {
    console.error('[Seed] Error during seeding:', err.message);
  }
}

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = seed;
