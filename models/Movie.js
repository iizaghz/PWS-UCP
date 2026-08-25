const movieRepository = require('../repositories/movieRepository');

class Movie {
  constructor(data = {}) {
    this.id = data.id;
    this.title = data.title;
    this.original_title = data.original_title;
    this.slug = data.slug;
    this.overview = data.overview;
    this.tagline = data.tagline;
    this.release_date = data.release_date;
    this.runtime = data.runtime;
    this.budget = data.budget;
    this.revenue = data.revenue;
    this.popularity = data.popularity;
    this.vote_average = data.vote_average;
    this.vote_count = data.vote_count;
    this.original_language = data.original_language;
    this.status = data.status;
    this.poster_url = data.poster_url;
    this.backdrop_url = data.backdrop_url;
    this.trailer_url = data.trailer_url;
    this.genres = data.genres || [];
    this.production_companies = data.production_companies || [];
    this.cast = data.cast || [];
  }

  static async findAll(params) {
    const result = await movieRepository.findAll(params);
    return {
      ...result,
      movies: result.movies.map(m => new Movie(m))
    };
  }

  static async findById(id) {
    const raw = await movieRepository.findById(id);
    return raw ? new Movie(raw) : null;
  }

  static async findBySlug(slug) {
    const raw = await movieRepository.findBySlug(slug);
    return raw ? new Movie(raw) : null;
  }
}

module.exports = Movie;
