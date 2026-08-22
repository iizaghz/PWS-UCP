const express = require('express');
const router = express.Router();
const moviesController = require('../controllers/moviesController');
const { authenticateApiKey } = require('../middleware/apiKeyMiddleware');

// Public API requires x-api-key header
router.use(authenticateApiKey);

router.get('/movies', moviesController.getMovies);
router.get('/movies/slug/:slug', moviesController.getMovieBySlug);
router.get('/movies/:id', moviesController.getMovieById);
router.get('/movies/:id/cast', moviesController.getMovieCast);
router.get('/movies/:id/reviews', moviesController.getMovieReviews);

router.get('/genres', moviesController.getGenres);
router.get('/genres/:id', moviesController.getGenreById);

router.get('/people', moviesController.getPeople);
router.get('/people/:id', moviesController.getPersonById);

router.get('/companies', moviesController.getCompanies);

module.exports = router;
