const moviesService = require('../services/moviesService');
const { success, error } = require('../utils/response');

async function getMovies(req, res) {
  try {
    const result = await moviesService.getMovies(req.query);
    return success(res, result.movies, result.meta);
  } catch (err) {
    return error(res, 'FETCH_MOVIES_FAILED', err.message, 500);
  }
}

async function getMovieById(req, res) {
  try {
    const movie = await moviesService.getMovieById(req.params.id);
    return success(res, movie);
  } catch (err) {
    return error(res, err.code || 'FETCH_MOVIE_FAILED', err.message, err.statusCode || 500);
  }
}

async function getMovieBySlug(req, res) {
  try {
    const movie = await moviesService.getMovieBySlug(req.params.slug);
    return success(res, movie);
  } catch (err) {
    return error(res, err.code || 'FETCH_MOVIE_FAILED', err.message, err.statusCode || 500);
  }
}

async function getGenres(req, res) {
  try {
    const genres = await moviesService.getGenres();
    return success(res, genres);
  } catch (err) {
    return error(res, 'FETCH_GENRES_FAILED', err.message, 500);
  }
}

async function getGenreById(req, res) {
  try {
    const genre = await moviesService.getGenreById(req.params.id);
    return success(res, genre);
  } catch (err) {
    return error(res, err.code || 'FETCH_GENRE_FAILED', err.message, err.statusCode || 500);
  }
}

async function getPeople(req, res) {
  try {
    const { page, limit, search } = req.query;
    const result = await moviesService.getPeople(page, limit, search);
    return success(res, result.people, result.meta);
  } catch (err) {
    return error(res, 'FETCH_PEOPLE_FAILED', err.message, 500);
  }
}

async function getPersonById(req, res) {
  try {
    const person = await moviesService.getPersonById(req.params.id);
    return success(res, person);
  } catch (err) {
    return error(res, err.code || 'FETCH_PERSON_FAILED', err.message, err.statusCode || 500);
  }
}

async function getMovieCast(req, res) {
  try {
    const cast = await moviesService.getMovieCast(req.params.id);
    return success(res, cast);
  } catch (err) {
    return error(res, err.code || 'FETCH_CAST_FAILED', err.message, err.statusCode || 500);
  }
}

async function getMovieReviews(req, res) {
  try {
    const reviews = await moviesService.getMovieReviews(req.params.id);
    return success(res, reviews);
  } catch (err) {
    return error(res, err.code || 'FETCH_REVIEWS_FAILED', err.message, err.statusCode || 500);
  }
}

async function getCompanies(req, res) {
  try {
    const companies = await moviesService.getCompanies();
    return success(res, companies);
  } catch (err) {
    return error(res, 'FETCH_COMPANIES_FAILED', err.message, 500);
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
