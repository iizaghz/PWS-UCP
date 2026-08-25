# CineData API — Platform SaaS Data Film

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

CineData API adalah platform API RESTful SaaS berkinerja tinggi untuk metadata film dan hiburan. Dibuat dengan Node.js, Express, dan PostgreSQL, CineData API menyediakan manajemen API key pengembang, SHA-256 secret hashing, JWT authentication, tier-based rate limiting,, dan pencatatan telemetri penggunaan secara real-time.

---

## Fitur Utama

- **Autentikasi JWT**: Registrasi pengguna, login, dan verifikasi sesi melalui `/api/auth/*`.
- **Manajemen API Key**: Create, list, revoke, dan delete API keys dengan awalan (`cd_live_...`), SHA-256 secret hashing, dan expiration management.
- **Katalog Metadata Film**: Akses ke 185+ film, 23 genre, 105 pemeran & kru, 32 perusahaan produksi, dan 550+ ulasan.
- **Penyaringan, Pengurutan & Paginasi**: Cari film berdasarkan judul/ringkasan, filter berdasarkan genre, tahun rilis, rating minimum, bahasa, anggaran, dan pengurutan multibidang (`-rating`, `popularity`, `release_date`).
- **Middleware Pembatas Laju (Rate Limiting)**: Autentikasi berbasis header (`x-api-key`) dengan batas permintaan per tingkatan (Free: 100 req/jam, Dev: 1.000 req/jam, Enterprise: 10.000 req/jam).
- **Telemetri Real-Time & Polling Telemetri**: Pencatatan permintaan otomatis (latensi, kode status, endpoint, IP, user-agent) dengan pemantauan metrik live pada dashboard.


---

## Teknologi yang Digunakan

- **Backend Framework**: Node.js, Express.js
- **Database Layer**: PostgreSQL (Supabase) via `pg` pool connector with internal state fallback engine
- **Security Protocols**: JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), Key Hashing (`crypto` SHA-256), Helmet headers, CORS policies
- **Design System**: Vanilla HTML5, Vanilla CSS3 utilizing OKLCH design tokens, Google Fonts (`Space Grotesk`, `Plus Jakarta Sans`, `JetBrains Mono`)
- **Deployment Strategy**: Vercel Serverless Functions configuration (`vercel.json`)

---

## Arsitektur Sistem

```
Klien Pengguna / Pengembang
 └── Dashboard Web SaaS (SPA)
      ├── Autentikasi JWT (/api/auth/*)
      ├── Manajemen API Key (/api/keys/*)
      └── Analitik Telemetri (/api/usage/*)

Aplikasi Eksternal / SDK Pengembang
 └── Klien HTTP (Header: x-api-key)
      └── REST API Publik (/api/v1/*)
           ├── Middleware API Key & Rate Limiting
           ├── Pengontrol (Controllers) & Lapisan Layanan (Service Layer)
           ├── Pool Basis Data PostgreSQL / Supabase
           └── Pencatat Telemetri Asinkron (Asynchronous Telemetry Logger)
```

---

## Struktur Repositori

```
cinedata-api/
├── config/                    # Connection pool basis data & pengelola status fallback
│   └── db.js
├── controllers/               # Penangan permintaan HTTP (Request handlers)
│   ├── authController.js
│   ├── keysController.js
│   ├── moviesController.js
│   └── usageController.js
├── database/                  # DDL SQL Skema & Mesin Fallback In-Memory
│   ├── inMemoryEngine.js
│   └── schema.sql
├── docs/                      # Diagram arsitektur (ERD, Use Case, Activity, User Flow)
│   ├── activity.svg
│   ├── api-architecture.svg
│   ├── DIAGRAMS.md
│   ├── erd.svg
│   ├── usecase.svg
│   └── userflow.svg
├── middleware/                # Middleware autentikasi JWT & API Key
│   ├── apiKeyMiddleware.js
│   └── authMiddleware.js
├── public/                    # Aset Dashboard Web Frontend
│   ├── app.js
│   ├── index.html
│   ├── logo.svg
│   └── style.css
├── repositories/              # Lapisan repositori data
│   ├── keysRepository.js
│   ├── moviesRepository.js
│   ├── usageRepository.js
│   └── userRepository.js
├── routes/                    # Definisi rute Express
│   ├── authRoutes.js
│   ├── keysRoutes.js
│   ├── publicRoutes.js
│   └── usageRoutes.js
├── seed/                      # Skrip seeder & dataset basis data
│   ├── seed.js
│   └── seedData.js
├── services/                  # Layanan logika bisnis
│   ├── authService.js
│   ├── keysService.js
│   ├── moviesService.js
│   └── usageService.js
├── test/                      # Penguji integrasi (Integration test runner)
│   └── runner.js
├── utils/                     # Pembantu respons & utilitas JWT
│   ├── auth.js
│   └── response.js
├── .env.example               # Templat variabel lingkungan (environment variables)
├── .gitignore                 # Spesifikasi pengecualian Git
├── app.js                     # Berkas utama server Express
├── package.json               # Konfigurasi paket & skrip
├── PRD.md                     # Dokumen Persyaratan Produk (Product Requirements Document)
├── README.md                  # Dokumentasi proyek
└── vercel.json                # Konfigurasi penggelaran Vercel
```

---

## Panduan Cepat & Instalasi

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy  environment variables template ke .env::
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/cinedata_db
JWT_SECRET=super_secret_jwt_key_cinedata_2026
API_KEY_SECRET=cinedata_api_key_hmac_secret_2026
```

### 3. Database Seeding
Isi basis data dengan dataset demo (185+ film, 23 genre, 105 pemeran, 32 perusahaan, 550+ ulasan):
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000).

**Kredensial Demo Bawaan:**
- **Email Pengembang**: `admin@cinedata.io`
- **Kata Sandi**: `password123`
- **API Key Demo**: `cd_live_demo1234567890abcdef`

---

## Referensi Endpoint API

### Authentication Endpoints (JWT Required for /me)
| Metode | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/auth/register` | Mendaftarkan akun pengembang baru |
| `POST` | `/api/auth/login` | Otentikasi pengembang dan dapatkan token sesi JWT |
| `GET` | `/api/auth/me` | Mengambil profil pengembang yang terautentikasi |
| `POST` | `/api/auth/logout` | Mengakhiri sesi pengembang |

### API Key Management (Requires Header Authorization: Bearer <token>)
| Metode | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/keys` | Membuat API Key baru (mengembalikan rahasia mentah sekali saja) |
| `GET` | `/api/keys` | Menampilkan daftar semua API Key milik pengembang |
| `GET` | `/api/keys/:id` | Mengambil metadata API Key spesifik |
| `PATCH` | `/api/keys/:id/revoke` | Mencabut (revoke) API Key aktif |
| `DELETE` | `/api/keys/:id` | Menghapus catatan API Key secara permanen |

### Public Movie Metadata API (Requires Header x-api-key: cd_live_...)
| Metode | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/v1/movies` | Menampilkan daftar film dengan paginasi, filter, dan pengurutan |
| `GET` | `/api/v1/movies/:id` | Mengambil rincian metadata film berdasarkan ID |
| `GET` | `/api/v1/movies/slug/:slug` | Mengambil rincian film berdasarkan URL slug |
| `GET` | `/api/v1/movies/:id/cast` | Mengambil daftar pemeran untuk film tertentu |
| `GET` | `/api/v1/movies/:id/reviews` | Mengambil daftar ulasan untuk film tertentu |
| `GET` | `/api/v1/genres` | Menampilkan daftar semua genre film |
| `GET` | `/api/v1/genres/:id` | Mengambil metadata genre dan jumlah film terkait |
| `GET` | `/api/v1/people` | Menampilkan daftar aktor, sutradara, dan kru |
| `GET` | `/api/v1/people/:id` | Mengambil rincian orang dan filmografinya |
| `GET` | `/api/v1/companies` | Menampilkan daftar perusahaan produksi film utama |

---

## Contoh Query Filtering & Sorting

- **Search by Query**: `GET /api/v1/movies?search=nolan`
- **Filter Berdasarkan Genre**: `GET /api/v1/movies?genre=action`
- **Filter Berdasarkan Tahun Rilis**: `GET /api/v1/movies?year=2023`
- **Filter Berdasarkan Rating Minimum**: `GET /api/v1/movies?rating_min=8.5`
- **Sorting**: `GET /api/v1/movies?sort=-rating` (menurun) atau `?sort=release_date`
- **Paginasi**: `GET /api/v1/movies?page=1&limit=10`

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

Jalankan suite pengujian integrasi:
```bash
npm test
```
Suite pengujian menguji 13 skenario end-to-end terpisah mencakup autentikasi, pembuatan API key, hashing, pembatasan laju (rate limiting), otorisasi endpoint publik, dan penanganan kesalahan (error handling).

---


