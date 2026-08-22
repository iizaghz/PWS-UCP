-- CineData API Database Schema for PostgreSQL / Supabase

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(32) NOT NULL,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  environment VARCHAR(20) DEFAULT 'live',
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Movies Table
CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  original_title VARCHAR(255),
  slug VARCHAR(255) UNIQUE NOT NULL,
  overview TEXT,
  tagline TEXT,
  release_date DATE,
  runtime INTEGER,
  budget BIGINT,
  revenue BIGINT,
  popularity NUMERIC(10, 2) DEFAULT 0.0,
  vote_average NUMERIC(3, 1) DEFAULT 0.0,
  vote_count INTEGER DEFAULT 0,
  original_language VARCHAR(10) DEFAULT 'en',
  status VARCHAR(50) DEFAULT 'Released',
  poster_url TEXT,
  backdrop_url TEXT,
  trailer_url TEXT,
  age_rating VARCHAR(10) DEFAULT 'PG-13',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Genres Table
CREATE TABLE IF NOT EXISTS genres (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL
);

-- Movie Genres Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS movie_genres (
  movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
  genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, genre_id)
);

-- People Table (Actors, Directors, Crew)
CREATE TABLE IF NOT EXISTS people (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  profile_url TEXT,
  biography TEXT,
  birth_date DATE,
  birth_place VARCHAR(255)
);

-- Movie Cast Table
CREATE TABLE IF NOT EXISTS movie_cast (
  id SERIAL PRIMARY KEY,
  movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  character_name VARCHAR(255) NOT NULL,
  cast_order INTEGER DEFAULT 0
);

-- Movie Crew Table
CREATE TABLE IF NOT EXISTS movie_crew (
  id SERIAL PRIMARY KEY,
  movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  department VARCHAR(100) NOT NULL,
  job VARCHAR(100) NOT NULL
);

-- Production Companies Table
CREATE TABLE IF NOT EXISTS production_companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  logo_url TEXT
);

-- Movie Companies Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS movie_companies (
  movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
  company_id INTEGER REFERENCES production_companies(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, company_id)
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
  author VARCHAR(255) NOT NULL,
  rating NUMERIC(3, 1) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- API Usage Logs Table
CREATE TABLE IF NOT EXISTS api_usage (
  id SERIAL PRIMARY KEY,
  api_key_id INTEGER REFERENCES api_keys(id) ON DELETE SET NULL,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_movies_slug ON movies(slug);
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
CREATE INDEX IF NOT EXISTS idx_movies_release_date ON movies(release_date);
CREATE INDEX IF NOT EXISTS idx_movies_popularity ON movies(popularity);
CREATE INDEX IF NOT EXISTS idx_movies_vote_average ON movies(vote_average);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_usage_api_key_id ON api_usage(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_requested_at ON api_usage(requested_at);
