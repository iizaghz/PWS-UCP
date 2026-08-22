const db = require('../config/db');
const movieRepository = require('../repositories/movieRepository');

async function getMovies(queryParams) {
  const result = await movieRepository.findAll(queryParams);
  return {
    movies: result.movies,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      total_pages: result.total_pages
    }
  };
}

async function getMovieById(movieId) {
  const movie = await movieRepository.findById(movieId);
  if (!movie) {
    const err = new Error('Movie not found');
    err.code = 'MOVIE_NOT_FOUND';
    err.statusCode = 404;
    throw err;
  }
  return movie;
}

async function getMovieBySlug(slug) {
  const movie = await movieRepository.findBySlug(slug);
  if (!movie) {
    const err = new Error('Movie not found');
    err.code = 'MOVIE_NOT_FOUND';
    err.statusCode = 404;
    throw err;
  }
  return movie;
}

async function getGenres() {
  const isPg = db.getIsConnected();
  if (isPg) {
    const res = await db.query(`SELECT id, name, slug FROM genres ORDER BY name ASC;`);
    return res.rows;
  } else {
    return db.memoryDb.genres;
  }
}

async function getGenreById(genreId) {
  const isPg = db.getIsConnected();
  if (isPg) {
    const res = await db.query(`SELECT * FROM genres WHERE id = $1 LIMIT 1;`, [genreId]);
    if (res.rows.length === 0) {
      const err = new Error('Genre not found');
      err.code = 'GENRE_NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    const countRes = await db.query(`SELECT COUNT(*) as movie_count FROM movie_genres WHERE genre_id = $1;`, [genreId]);
    return {
      ...res.rows[0],
      movie_count: parseInt(countRes.rows[0].movie_count)
    };
  } else {
    const g = db.memoryDb.genres.find(x => x.id === parseInt(genreId));
    if (!g) {
      const err = new Error('Genre not found');
      err.code = 'GENRE_NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    const count = db.memoryDb.movies.filter(m => m.genreIds && m.genreIds.includes(g.id)).length;
    return { ...g, movie_count: count };
  }
}

async function getPeople(page = 1, limit = 20, search = '') {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;
  const isPg = db.getIsConnected();

  if (isPg) {
    let whereClause = search ? `WHERE name ILIKE $1` : '';
    let params = search ? [`%${search}%`] : [];
    let countSql = `SELECT COUNT(*) as total FROM people ${whereClause};`;
    let countRes = await db.query(countSql, params);
    let total = parseInt(countRes.rows[0].total);

    let dataSql = `SELECT * FROM people ${whereClause} ORDER BY name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2};`;
    let dataRes = await db.query(dataSql, [...params, limitNum, offset]);

    return {
      people: dataRes.rows,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum)
      }
    };
  } else {
    let filtered = [...db.memoryDb.people];
    if (search) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limitNum);
    return {
      people: paginated,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum)
      }
    };
  }
}

async function getPersonById(personId) {
  const isPg = db.getIsConnected();
  if (isPg) {
    const res = await db.query(`SELECT * FROM people WHERE id = $1 LIMIT 1;`, [personId]);
    if (res.rows.length === 0) {
      const err = new Error('Person not found');
      err.code = 'PERSON_NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    return res.rows[0];
  } else {
    const p = db.memoryDb.people.find(x => x.id === parseInt(personId));
    if (!p) {
      const err = new Error('Person not found');
      err.code = 'PERSON_NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    return p;
  }
}

async function getMovieCast(movieId) {
  const isPg = db.getIsConnected();
  if (isPg) {
    const res = await db.query(
      `SELECT mc.id, mc.character_name, mc.cast_order, p.id as person_id, p.name, p.profile_url
       FROM movie_cast mc
       JOIN people p ON mc.person_id = p.id
       WHERE mc.movie_id = $1
       ORDER BY mc.cast_order ASC;`,
      [movieId]
    );
    return res.rows;
  } else {
    await getMovieById(movieId); // Validate existence
    return db.memoryDb.people.slice(0, 5).map((p, i) => ({
      id: i + 1,
      character_name: i === 0 ? 'Lead Character' : 'Supporting Role',
      cast_order: i + 1,
      person_id: p.id,
      name: p.name,
      profile_url: p.profile_url
    }));
  }
}

async function getMovieReviews(movieId) {
  const isPg = db.getIsConnected();
  if (isPg) {
    const res = await db.query(
      `SELECT id, author, rating, content, created_at FROM reviews WHERE movie_id = $1 ORDER BY created_at DESC;`,
      [movieId]
    );
    return res.rows;
  } else {
    await getMovieById(movieId); // Validate existence
    return db.memoryDb.reviews.filter(r => r.movie_id === parseInt(movieId));
  }
}

async function getCompanies() {
  const isPg = db.getIsConnected();
  if (isPg) {
    const res = await db.query(`SELECT id, name, country, logo_url FROM production_companies ORDER BY name ASC;`);
    return res.rows;
  } else {
    return db.memoryDb.production_companies;
  }
}

module.exports = {
  getMovies,
  getMovieById,
  getMovieBySlug,
  getGenres,
  getGenreById,
  getPeople,
  getPersonById,
  getMovieCast,
  getMovieReviews,
  getCompanies
};
