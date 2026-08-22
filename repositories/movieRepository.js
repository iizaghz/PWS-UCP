const db = require('../config/db');

async function findAll({ search, genre, year, rating_min, language, status, min_budget, max_budget, sort, page = 1, limit = 10 }) {
  const isPg = db.getIsConnected();
  const offset = (page - 1) * limit;

  if (isPg) {
    let whereConditions = [];
    let params = [];
    let paramIdx = 1;

    if (search) {
      whereConditions.push(`(m.title ILIKE $${paramIdx} OR m.overview ILIKE $${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }
    if (year) {
      whereConditions.push(`EXTRACT(YEAR FROM m.release_date) = $${paramIdx}`);
      params.push(parseInt(year));
      paramIdx++;
    }
    if (rating_min) {
      whereConditions.push(`m.vote_average >= $${paramIdx}`);
      params.push(parseFloat(rating_min));
      paramIdx++;
    }
    if (language) {
      whereConditions.push(`m.original_language = $${paramIdx}`);
      params.push(language);
      paramIdx++;
    }
    if (status) {
      whereConditions.push(`m.status = $${paramIdx}`);
      params.push(status);
      paramIdx++;
    }
    if (min_budget) {
      whereConditions.push(`m.budget >= $${paramIdx}`);
      params.push(parseFloat(min_budget));
      paramIdx++;
    }
    if (max_budget) {
      whereConditions.push(`m.budget <= $${paramIdx}`);
      params.push(parseFloat(max_budget));
      paramIdx++;
    }
    if (genre) {
      whereConditions.push(`m.id IN (
        SELECT mg.movie_id FROM movie_genres mg 
        JOIN genres g ON mg.genre_id = g.id 
        WHERE LOWER(g.name) = $${paramIdx} OR LOWER(g.slug) = $${paramIdx}
      )`);
      params.push(genre.toLowerCase());
      paramIdx++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    let orderBy = 'm.popularity DESC';
    if (sort) {
      const isDesc = sort.startsWith('-');
      const field = isDesc ? sort.substring(1) : sort;
      const dir = isDesc ? 'DESC' : 'ASC';
      if (['rating', 'vote_average'].includes(field)) orderBy = `m.vote_average ${dir}`;
      else if (['release_date', 'year'].includes(field)) orderBy = `m.release_date ${dir}`;
      else if (field === 'popularity') orderBy = `m.popularity ${dir}`;
      else if (field === 'title') orderBy = `m.title ${dir}`;
      else if (field === 'vote_count') orderBy = `m.vote_count ${dir}`;
    }

    const countResult = await db.query(`SELECT COUNT(*) FROM movies m ${whereClause};`, params);
    const total = parseInt(countResult.rows[0].count);

    const query = `
      SELECT m.*, 
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object('id', g.id, 'name', g.name, 'slug', g.slug)
          ) FILTER (WHERE g.id IS NOT NULL), '[]'
        ) as genres
      FROM movies m
      LEFT JOIN movie_genres mg ON m.id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      ${whereClause}
      GROUP BY m.id
      ORDER BY ${orderBy}
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1};
    `;
    params.push(limit, offset);

    const moviesResult = await db.query(query, params);
    return {
      movies: moviesResult.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(total / limit)
    };
  }

  // Fallback memory database query
  let resultList = [...db.memoryDb.movies];

  if (search) {
    const s = search.toLowerCase();
    resultList = resultList.filter(m => 
      (m.title && m.title.toLowerCase().includes(s)) ||
      (m.original_title && m.original_title.toLowerCase().includes(s)) ||
      (m.overview && m.overview.toLowerCase().includes(s))
    );
  }
  if (year) {
    resultList = resultList.filter(m => new Date(m.release_date).getFullYear() === parseInt(year));
  }
  if (rating_min) {
    resultList = resultList.filter(m => m.vote_average >= parseFloat(rating_min));
  }
  if (language) {
    resultList = resultList.filter(m => m.original_language === language);
  }
  if (status) {
    resultList = resultList.filter(m => m.status && m.status.toLowerCase() === status.toLowerCase());
  }
  if (min_budget) {
    resultList = resultList.filter(m => m.budget >= parseInt(min_budget));
  }
  if (max_budget) {
    resultList = resultList.filter(m => m.budget <= parseInt(max_budget));
  }
  if (genre) {
    const gSlug = genre.toLowerCase();
    const matchedGenreObj = db.memoryDb.genres.find(g => g.slug === gSlug || g.name.toLowerCase() === gSlug || g.id === parseInt(genre));
    if (matchedGenreObj) {
      const movieIds = db.memoryDb.movie_genres.filter(mg => mg.genre_id === matchedGenreObj.id).map(mg => mg.movie_id);
      resultList = resultList.filter(m => (m.genreIds && m.genreIds.includes(matchedGenreObj.id)) || movieIds.includes(m.id));
    }
  }

  if (sort) {
    const isDesc = sort.startsWith('-');
    const field = isDesc ? sort.substring(1) : sort;
    const mult = isDesc ? -1 : 1;
    resultList.sort((a, b) => {
      if (field === 'rating' || field === 'vote_average') return (a.vote_average - b.vote_average) * mult;
      if (field === 'release_date') return (new Date(a.release_date) - new Date(b.release_date)) * mult;
      if (field === 'popularity') return (a.popularity - b.popularity) * mult;
      if (field === 'title') return a.title.localeCompare(b.title) * mult;
      return 0;
    });
  }

  const total = resultList.length;
  const paginated = resultList.slice(offset, offset + limit).map(m => {
    const gIds = db.memoryDb.movie_genres.filter(mg => mg.movie_id === m.id).map(mg => mg.genre_id);
    const genres = db.memoryDb.genres.filter(g => gIds.includes(g.id));
    return { ...m, genres };
  });

  return {
    movies: paginated,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    total_pages: Math.ceil(total / limit)
  };
}

async function findById(id) {
  const isPg = db.getIsConnected();
  if (isPg) {
    const query = `
      SELECT m.*,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', g.id, 'name', g.name, 'slug', g.slug)) FILTER (WHERE g.id IS NOT NULL), '[]') as genres,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', pc.id, 'name', pc.name, 'country', pc.country)) FILTER (WHERE pc.id IS NOT NULL), '[]') as production_companies,
        COALESCE(json_agg(DISTINCT jsonb_build_object('person_id', p.id, 'name', p.name, 'character_name', mc_cast.character_name, 'cast_order', mc_cast.cast_order)) FILTER (WHERE p.id IS NOT NULL), '[]') as cast
      FROM movies m
      LEFT JOIN movie_genres mg ON m.id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      LEFT JOIN movie_companies mc ON m.id = mc.movie_id
      LEFT JOIN production_companies pc ON mc.company_id = pc.id
      LEFT JOIN movie_cast mc_cast ON m.id = mc_cast.movie_id
      LEFT JOIN people p ON mc_cast.person_id = p.id
      WHERE m.id = $1
      GROUP BY m.id;
    `;
    const res = await db.query(query, [id]);
    return res.rows[0] || null;
  }

  const m = db.memoryDb.movies.find(x => x.id === parseInt(id));
  if (!m) return null;
  const gIds = db.memoryDb.movie_genres.filter(mg => mg.movie_id === m.id).map(mg => mg.genre_id);
  const genres = db.memoryDb.genres.filter(g => gIds.includes(g.id));
  const compList = db.memoryDb.production_companies.slice(0, 2);
  const castList = db.memoryDb.people.slice(0, 5).map((p, i) => ({
    person_id: p.id,
    name: p.name,
    profile_url: p.profile_url,
    character_name: i === 0 ? 'Protagonist' : 'Supporting Role',
    cast_order: i + 1
  }));
  return { ...m, genres, production_companies: compList, cast: castList };
}

async function findBySlug(slug) {
  const isPg = db.getIsConnected();
  if (isPg) {
    const query = `
      SELECT m.*,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', g.id, 'name', g.name, 'slug', g.slug)) FILTER (WHERE g.id IS NOT NULL), '[]') as genres
      FROM movies m
      LEFT JOIN movie_genres mg ON m.id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      WHERE LOWER(m.slug) = $1
      GROUP BY m.id;
    `;
    const res = await db.query(query, [slug.toLowerCase()]);
    return res.rows[0] || null;
  }

  const m = db.memoryDb.movies.find(x => x.slug.toLowerCase() === slug.toLowerCase());
  if (!m) return null;
  const gIds = db.memoryDb.movie_genres.filter(mg => mg.movie_id === m.id).map(mg => mg.genre_id);
  const genres = db.memoryDb.genres.filter(g => gIds.includes(g.id));
  return { ...m, genres };
}

module.exports = {
  findAll,
  findById,
  findBySlug
};
