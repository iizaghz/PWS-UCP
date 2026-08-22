# CineData API System Diagrams & Academic Documentation

This document contains the visual architecture, ERD, Use Case, Activity Diagram, and User Flow specifications for **CineData API**.

---

## 1. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ api_keys : "owns"
    api_keys ||--o{ api_usage : "logs"
    movies ||--o{ movie_genres : "has"
    genres ||--o{ movie_genres : "categorizes"
    movies ||--o{ movie_cast : "features"
    people ||--o{ movie_cast : "acts in"
    movies ||--o{ movie_crew : "credits"
    people ||--o{ movie_crew : "works in"
    movies ||--o{ movie_companies : "produced by"
    production_companies ||--o{ movie_companies : "produces"
    movies ||--o{ reviews : "receives"

    users {
        int id PK
        string name
        string email UK
        string password_hash
        timestamp created_at
    }

    api_keys {
        int id PK
        int user_id FK
        string name
        string key_prefix
        string key_hash UK
        string environment
        boolean is_active
        timestamp expires_at
        timestamp last_used_at
    }

    movies {
        int id PK
        string title
        string slug UK
        text overview
        date release_date
        int runtime
        bigint budget
        bigint revenue
        numeric popularity
        numeric vote_average
        int vote_count
        string original_language
        string status
    }

    genres {
        int id PK
        string name UK
        string slug UK
    }

    people {
        int id PK
        string name
        text biography
        date birth_date
    }

    production_companies {
        int id PK
        string name
        string country
    }

    reviews {
        int id PK
        int movie_id FK
        string author
        numeric rating
        text content
    }

    api_usage {
        int id PK
        int api_key_id FK
        string endpoint
        string method
        int status_code
        int response_time
        string ip_address
    }
```

---

## 2. Use Case Diagram

```mermaid
graph TD
    User(("Developer / User"))
    ExtApp(("External Application"))
    Sys(("CineData API System"))

    subgraph "CineData SaaS Platform"
        UC1[Register Account]
        UC2[Login & Obtain JWT]
        UC3[Create & Manage API Keys]
        UC4[Revoke API Key]
        UC5[View Usage Analytics]
        UC6[Test Endpoint via Try API]

        UC7[Request Movies List]
        UC8[Filter Movies by Genre/Year/Rating]
        UC9[Get Movie Detail by ID/Slug]
        UC10[Get Cast & Critic Reviews]

        UC11[Authenticate JWT]
        UC12[Validate API Key & Hash]
        UC13[Enforce Rate Limiting]
        UC14[Log API Request to Database]
    end

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6

    ExtApp --> UC7
    ExtApp --> UC8
    ExtApp --> UC9
    ExtApp --> UC10

    UC7 -.-> UC12
    UC8 -.-> UC12
    UC9 -.-> UC12
    UC10 -.-> UC12

    Sys --> UC11
    Sys --> UC12
    Sys --> UC13
    Sys --> UC14
```

---

## 3. Activity Diagram (API Request Lifecycle)

```mermaid
stateDiagram-v2
    [*] --> ReceiveRequest: Client sends HTTP request with x-api-key
    ReceiveRequest --> ExtractHeader: Read x-api-key header
    ExtractHeader --> CheckHeaderExist{Key Header Present?}

    CheckHeaderExist --> |No| ErrMissingKey: Return 401 MISSING_API_KEY
    CheckHeaderExist --> |Yes| HashKey: Compute SHA-256 Hash of key

    HashKey --> QueryDbKey: Lookup key_hash in PostgreSQL / Supabase
    QueryDbKey --> CheckKeyFound{Key Record Exists?}

    CheckKeyFound --> |No| ErrInvalidKey: Return 401 INVALID_API_KEY
    CheckKeyFound --> |Yes| CheckActive{Is Key Active?}

    CheckActive --> |No| ErrInactiveKey: Return 403 INACTIVE_API_KEY
    CheckActive --> |Yes| CheckExpired{Has Key Expired?}

    CheckExpired --> |Yes| ErrExpiredKey: Return 401 EXPIRED_API_KEY
    CheckExpired --> |No| CheckRateLimit{Hourly Limit Exceeded?}

    CheckRateLimit --> |Yes| ErrRateLimit: Return 429 RATE_LIMIT_EXCEEDED
    CheckRateLimit --> |No| QueryMovieData: Execute Controller & PostgreSQL Query

    QueryMovieData --> UpdateLastUsed: Asynchronously update last_used_at
    UpdateLastUsed --> LogApiUsage: Insert log entry to api_usage table
    LogApiUsage --> ReturnJsonResponse: Return HTTP 200 OK + Standard JSON Payload

    ErrMissingKey --> [*]
    ErrInvalidKey --> [*]
    ErrInactiveKey --> [*]
    ErrExpiredKey --> [*]
    ErrRateLimit --> [*]
    ReturnJsonResponse --> [*]
```

---

## 4. User Flow

```mermaid
graph LR
    A[Visit CineData Dashboard] --> B{Authenticated?}
    B -->|No| C[Register / Login]
    C --> D[Obtain JWT Token]
    D --> E[Dashboard Overview]
    B -->|Yes| E
    E --> F[API Keys Section]
    F --> G[Generate API Key]
    G --> H[Copy API Secret cd_live_...]
    H --> I[Open Interactive Try API / Docs]
    I --> J[Configure Headers & Run Request]
    J --> K[View Realtime Response & Latency]
    K --> L[Monitor Usage Analytics & Logs]
```

---

## 5. System Architecture Diagram

```mermaid
graph TD
    ClientApp["External Developer App"] -->|x-api-key Header| PublicApi["Public API Endpoints (/api/v1/*)"]
    WebDashboard["SaaS Web Dashboard (SPA)"] -->|JWT Bearer Token| DashboardApi["Dashboard API (/api/auth, /api/keys, /api/usage)"]

    subgraph "Express.js Backend Server"
        PublicApi --> ApiKeyMW["API Key & Rate Limiting Middleware"]
        DashboardApi --> JwtMW["JWT Auth Middleware"]

        ApiKeyMW --> Controllers["Controllers & Services"]
        JwtMW --> Controllers

        Controllers --> Repositories["Data Repository Layer"]
    end

    Repositories -->|Pool Query| PostgresDB[("PostgreSQL / Supabase Database")]
    ApiKeyMW -.->|Async Logging| UsageLogger["API Usage Logger"]
    UsageLogger --> PostgresDB
```
