# CineData API — Movie Data SaaS Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

CineData API is a high-performance RESTful SaaS API platform for film and entertainment metadata. Built with Node.js, Express, and PostgreSQL, CineData API provides developer API key management, SHA-256 secret hashing, JWT authentication, tier-based rate limiting, real-time usage telemetry logging, and a web dashboard built following Hallmark design principles.

---

## Key Capabilities

- **JWT Authentication**: User registration, login, and session verification via `/api/auth/*`.
- **API Key Management**: Create, list, revoke, and delete API keys with prefixing (`cd_live_...`), SHA-256 secret hashing, and expiration management.
- **Movie Metadata Catalog**: Access to 185+ movies, 23 genres, 105 cast and crew members, 32 production companies, and 550+ reviews.
- **Filtering, Sorting & Pagination**: Search movies by title/overview, filter by genre, release year, minimum rating, language, budget, and multi-field sorting (`-rating`, `popularity`, `release_date`).
- **Rate Limiting Middleware**: Header-based authentication (`x-api-key`) with rate limits per tier (Free: 100 req/hr, Dev: 1,000 req/hr, Enterprise: 10,000 req/hr).
- **Real-Time Telemetry & Telemetry Polling**: Automatic request logging (latency, status codes, endpoints, IP, user-agent) with live dashboard metrics polling.
- **Hallmark Light Mode SaaS Dashboard**: Minimalist UI built with OKLCH light mode design tokens, single-family typography hierarchy, and SVG brand assets.

---

## Technology Stack

- **Backend Framework**: Node.js, Express.js
- **Database Layer**: PostgreSQL (Supabase) via `pg` pool connector with internal state fallback engine
- **Security Protocols**: JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), Key Hashing (`crypto` SHA-256), Helmet headers, CORS policies
- **Design System**: Vanilla HTML5, Vanilla CSS3 utilizing OKLCH design tokens, Google Fonts (`Space Grotesk`, `Plus Jakarta Sans`, `JetBrains Mono`)
- **Deployment Strategy**: Vercel Serverless Functions configuration (`vercel.json`)

---

## System Architecture

```
User / Developer Client
 └── SaaS Web Dashboard (SPA)
      ├── JWT Authentication (/api/auth/*)
      ├── API Key Management (/api/keys/*)
      └── Telemetry Analytics (/api/usage/*)

External Application / Developer SDK
 └── HTTP Client (Header: x-api-key)
      └── Public REST API (/api/v1/*)
           ├── API Key & Rate Limiting Middleware
           ├── Controllers & Service Layer
           ├── PostgreSQL / Supabase Database Pool
           └── Asynchronous Telemetry Logger
```

---

## Repository Structure

```
cinedata-api/
├── config/                    # Database connection pool & fallback state manager
│   └── db.js
├── controllers/               # HTTP Request handlers
│   ├── authController.js
│   ├── keysController.js
│   ├── moviesController.js
│   └── usageController.js
├── database/                  # Schema DDL SQL & In-Memory Fallback Engine
│   ├── inMemoryEngine.js
│   └── schema.sql
├── docs/                      # Architectural diagrams (ERD, Use Case, Activity, User Flow)
│   ├── activity.svg
│   ├── api-architecture.svg
│   ├── DIAGRAMS.md
│   ├── erd.svg
│   ├── usecase.svg
│   └── userflow.svg
├── middleware/                # JWT & API Key authentication middlewares
│   ├── apiKeyMiddleware.js
│   └── authMiddleware.js
├── public/                    # Frontend Web Dashboard Assets
│   ├── app.js
│   ├── index.html
│   ├── logo.svg
│   └── style.css
├── repositories/              # Data repository layer
│   ├── keysRepository.js
│   ├── moviesRepository.js
│   ├── usageRepository.js
│   └── userRepository.js
├── routes/                    # Express routing definitions
│   ├── authRoutes.js
│   ├── keysRoutes.js
│   ├── publicRoutes.js
│   └── usageRoutes.js
├── seed/                      # Database seed scripts & dataset
│   ├── seed.js
│   └── seedData.js
├── services/                  # Business logic services
│   ├── authService.js
│   ├── keysService.js
│   ├── moviesService.js
│   └── usageService.js
├── test/                      # Integration test runner
│   └── runner.js
├── utils/                     # Response helper & JWT utilities
│   ├── auth.js
│   └── response.js
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore specification
├── app.js                     # Root Express server entrypoint
├── package.json               # Package configuration & scripts
├── PRD.md                     # Product Requirements Document
├── README.md                  # Project documentation
└── vercel.json                # Vercel deployment configuration
```

---

## Quick Start & Installation

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy the environment variables template to `.env`:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/cinedata_db
JWT_SECRET=super_secret_jwt_key_cinedata_2026
API_KEY_SECRET=cinedata_api_key_hmac_secret_2026
```

### 3. Database Seeding
Populate the database with demo datasets (185+ movies, 23 genres, 105 cast members, 32 companies, 550+ reviews):
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

**Default Demo Credentials:**
- **Developer Email**: `admin@cinedata.io`
- **Password**: `password123`
- **Demo API Key**: `cd_live_demo1234567890abcdef`

---

## API Endpoint Reference

### Authentication Endpoints (JWT Required for `/me`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new developer account |
| `POST` | `/api/auth/login` | Authenticate developer and obtain JWT session token |
| `GET` | `/api/auth/me` | Retrieve authenticated developer profile |
| `POST` | `/api/auth/logout` | Terminate developer session |

### API Key Management (Requires Header `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/keys` | Generate a new API Key (returns secret raw key once) |
| `GET` | `/api/keys` | List all API Keys for authenticated developer |
| `GET` | `/api/keys/:id` | Get specific API Key metadata |
| `PATCH` | `/api/keys/:id/revoke` | Revoke active API Key |
| `DELETE` | `/api/keys/:id` | Permanently delete API Key record |

### Public Movie Metadata API (Requires Header `x-api-key: cd_live_...`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/movies` | List movies with pagination, filtering, and sorting |
| `GET` | `/api/v1/movies/:id` | Fetch detailed movie metadata by ID |
| `GET` | `/api/v1/movies/slug/:slug` | Fetch movie detail by URL slug |
| `GET` | `/api/v1/movies/:id/cast` | Fetch cast list for specified movie |
| `GET` | `/api/v1/movies/:id/reviews` | Fetch reviews for specified movie |
| `GET` | `/api/v1/genres` | List all movie genres |
| `GET` | `/api/v1/genres/:id` | Get genre metadata and associated movie count |
| `GET` | `/api/v1/people` | List actors, directors, and crew members |
| `GET` | `/api/v1/people/:id` | Fetch person details and filmography |
| `GET` | `/api/v1/companies` | List major film production companies |

---

## Query Filtering & Sorting Examples

- **Search by Query**: `GET /api/v1/movies?search=nolan`
- **Filter by Genre**: `GET /api/v1/movies?genre=action`
- **Filter by Release Year**: `GET /api/v1/movies?year=2023`
- **Filter by Minimum Rating**: `GET /api/v1/movies?rating_min=8.5`
- **Sorting**: `GET /api/v1/movies?sort=-rating` (descending) or `?sort=release_date`
- **Pagination**: `GET /api/v1/movies?page=1&limit=10`

---

## Standard JSON Response Payload

### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Inception",
      "slug": "inception",
      "vote_average": 8.8,
      "popularity": 98.4,
      "genres": [
        { "id": 1, "name": "Action", "slug": "action" },
        { "id": 15, "name": "Science Fiction", "slug": "science-fiction" }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 185,
    "total_pages": 19
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "INVALID_API_KEY",
    "message": "API key is invalid or inactive"
  }
}
```

---

## Automated Test Execution

Execute the integration test suite:
```bash
npm test
```
The test suite validates 13 distinct end-to-end scenarios covering authentication, API key generation, hashing, rate limiting, public endpoint authorization, and error handling.

---

## License

This project is licensed under the MIT License.
