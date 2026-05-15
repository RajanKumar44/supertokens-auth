# 🔐 SuperTokens Auth

A full-stack authentication system with **SuperTokens**, **PostgreSQL**, **Express.js**, and **React** — fully containerized with Docker.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router |
| Backend | Node.js, Express.js |
| Auth Engine | SuperTokens (self-hosted) |
| Database | PostgreSQL 15 |
| Containerization | Docker, Docker Compose |
| Password Security | BCrypt (auto-salted) |
| Email Verification | SuperTokens EmailVerification recipe |

---

## Features

- Email & Password authentication
- BCrypt password hashing (passwords never stored in plaintext)
- Email verification (REQUIRED mode)
- Session management with HTTP-only cookies
- Protected API routes with middleware
- Custom dark-themed UI
- Docker Compose — one command to run everything

---

## Folder Structure

```
supertokens-auth/
├── .env                          # Environment variables
├── .gitignore
├── docker-compose.yml            # Orchestrates all 4 services
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js              # Express server entry point
│       ├── config/
│       │   ├── supertokens.js    # SuperTokens init (EmailPassword + EmailVerification)
│       │   └── db.js             # PostgreSQL connection pool
│       ├── middlewares/
│       │   ├── auth.js           # Session verification middleware
│       │   └── errorHandler.js   # Global error handler
│       ├── routes/
│       │   ├── auth.routes.js    # /auth/user, /auth/logout
│       │   └── user.routes.js    # /api/users/me
│       └── controllers/
│           └── user.controller.js
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf                # SPA routing + API proxy
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── config/
│       │   └── supertokens.js    # Frontend SuperTokens config
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   └── Dashboard.jsx
│       ├── components/
│       │   ├── AuthForm.jsx      # Reusable login/signup form
│       │   └── ProtectedRoute.jsx
│       └── styles/
│           ├── index.css         # Design tokens + global reset
│           ├── auth.css          # Login/Signup styles
│           └── dashboard.css     # Dashboard styles
│
└── nginx/
    └── default.conf              # Reverse proxy config
```

---

## Architecture

```
┌──────────────┐     ┌────────────────┐     ┌─────────────────┐     ┌────────────┐
│   Frontend   │────▶│  Backend API   │────▶│ SuperTokens Core│────▶│ PostgreSQL │
│ React (3001) │     │ Express (5000) │     │     (3567)      │     │   (5432)   │
└──────────────┘     └────────────────┘     └─────────────────┘     └────────────┘
```

---

## How to Run

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Start

```bash
# Clone the repo
git clone https://github.com/<your-username>/supertokens-auth.git
cd supertokens-auth

# Start all 4 services
docker-compose up --build
```

### Access

| Service | URL |
|---|---|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:5000 |
| SuperTokens Core | http://localhost:3567/hello |

### Stop

```bash
docker-compose down

# To also delete the database volume:
docker-compose down -v
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/auth/signup` | ❌ | Register new user |
| POST | `/auth/signin` | ❌ | Login |
| POST | `/auth/signout` | ✅ | Logout |
| GET | `/auth/user` | ✅ | Get current user |
| GET | `/api/users/me` | ✅ | Get user profile |
| PUT | `/api/users/me` | ✅ | Update profile |
| GET | `/health` | ❌ | Health check |

---

## Environment Variables

All config is in the root `.env` file:

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_USER` | `supertokens_user` | Database username |
| `POSTGRES_PASSWORD` | `supertokens_secret_2024` | Database password |
| `POSTGRES_DB` | `supertokens_auth` | Database name |
| `BACKEND_PORT` | `5000` | Backend port |
| `FRONTEND_PORT` | `3001` | Frontend port |
| `SUPERTOKENS_PORT` | `3567` | SuperTokens Core port |

---

## Password Security

Passwords are hashed using **BCrypt** with automatic salting. The plaintext password is never stored. You can verify this by checking the database:

```bash
docker exec st_postgres psql -U supertokens_user -d supertokens_auth \
  -c "SELECT email, password_hash FROM emailpassword_users;"
```

Output shows BCrypt hashes like `$2a$11$...` — not plaintext.

---

## License

MIT
