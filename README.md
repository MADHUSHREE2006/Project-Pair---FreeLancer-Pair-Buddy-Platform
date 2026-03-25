# ProjectPair — Freelancer Pair-Buddy Platform

A premium full-stack SaaS platform connecting freelancers with complementary skills to build projects together.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Framer Motion, React Router v7 |
| Backend | Node.js, Express.js |
| Database | MySQL 8.0, Sequelize ORM |
| Real-time | Socket.io |
| Auth | JWT + bcrypt |
| Security | Helmet.js, express-rate-limit |
| Styling | CSS Variables, custom dark/light theme |

---

## Features

- JWT Authentication — register, login, forgot/reset password
- Projects — post, browse, search, filter by category
- Pair Proposals — send, accept, reject with real-time notifications
- Real-time Chat — Socket.io messaging, typing indicators, read receipts
- Kanban Dashboard — drag-and-drop task management
- Reviews & Ratings — partner-only reviews, auto avg recalculation
- Public Profiles — edit profile, skills, GitHub/portfolio links
- Notifications — real-time bell updates, mark as read, navigate on click
- Light / Dark mode toggle with localStorage persistence
- 404 page, code splitting, skeleton loaders

---

## Pages

| Route | Page | Auth |
|-------|------|------|
| `/` | Landing | No |
| `/login` | Login | No |
| `/signup` | Signup (2-step) | No |
| `/forgot-password` | Forgot Password | No |
| `/reset-password` | Reset Password | No |
| `/projects` | Browse Projects | No |
| `/projects/new` | Post a Project | Yes |
| `/projects/:id` | Project Detail | No |
| `/profile` | Own Profile | Yes |
| `/profile/:id` | Public Profile | No |
| `/dashboard` | Kanban Dashboard | Yes |
| `/chat` | Real-time Chat | Yes |
| `/portfolio` | Portfolio | Yes |
| `*` | 404 Not Found | No |

---

## Running Locally

### Prerequisites

- Node.js v18+
- MySQL 8.0
- Git

### Step 1 — Clone the repo

```bash
git clone https://github.com/MADHUSHREE2006/Project-Pair---FreeLancer-Pair-Buddy-Platform.git
cd Project-Pair---FreeLancer-Pair-Buddy-Platform
```

### Step 2 — Create the database

Open MySQL and run:

```sql
CREATE DATABASE projectpair CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 3 — Configure backend

```bash
cd project-pair-backend
copy .env.example .env
```

Open `.env` and fill in your credentials:

```
PORT=5000
DB_HOST=localhost
DB_NAME=projectpair
DB_USER=root
DB_PASS=your_mysql_password
JWT_SECRET=any_long_random_string
CLIENT_URL=http://localhost:5173
```

### Step 4 — Start the backend

```bash
cd project-pair-backend
npm install
node src/server.js
```

Expected output:
```
🚀 Server running on http://localhost:5000
✅ MySQL connected and tables synced
```

> Tables are created automatically on first run via Sequelize sync. No manual SQL needed.

### Step 5 — Configure frontend

Create `project-pair-frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

### Step 6 — Start the frontend

```bash
cd project-pair-frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Project Structure

```
project-pair-frontend/src/
├── context/        AuthContext, AppContext, ThemeContext
├── services/       api.js (Axios), socket.js (Socket.io)
├── components/     Navbar, Footer, Cursor, Toast, ProtectedRoute
└── pages/          All 14 pages

project-pair-backend/src/
├── controllers/    8 controllers (auth, projects, proposals, tasks, ...)
├── models/         7 Sequelize models
├── routes/         index.js — all 27 API endpoints
├── middleware/     JWT auth
└── server.js       Express + Socket.io + Helmet + CORS
```

---

## API Endpoints

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| GET | `/api/auth/me` | Yes |
| POST | `/api/auth/forgot-password` | No |
| POST | `/api/auth/reset-password` | No |
| GET | `/api/projects` | No |
| POST | `/api/projects` | Yes |
| GET | `/api/projects/:id` | No |
| PUT | `/api/projects/:id` | Yes |
| DELETE | `/api/projects/:id` | Yes |
| POST | `/api/proposals` | Yes |
| GET | `/api/proposals/mine` | Yes |
| GET | `/api/proposals/received` | Yes |
| PUT | `/api/proposals/:id` | Yes |
| GET | `/api/tasks/project/:id` | Yes |
| POST | `/api/tasks` | Yes |
| PUT | `/api/tasks/:id` | Yes |
| DELETE | `/api/tasks/:id` | Yes |
| GET | `/api/messages/conversations` | Yes |
| GET | `/api/messages/:userId` | Yes |
| GET | `/api/notifications` | Yes |
| PUT | `/api/notifications/read-all` | Yes |
| GET | `/api/reviews/:userId` | No |
| POST | `/api/reviews` | Yes |
| GET | `/api/users/:id` | No |
| PUT | `/api/users/me` | Yes |
| GET | `/health` | No |

---

## Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `send_message` | Client → Server | Send a chat message |
| `receive_message` | Server → Client | Deliver message to sender + receiver |
| `typing` | Client ↔ Server | Typing indicator |
| `mark_read` | Client → Server | Mark messages as read |
| `messages_read` | Server → Client | Notify sender of read |
| `notification` | Server → Client | Real-time notification delivery |
| `user_online` | Server → All | User connected |
| `user_offline` | Server → All | User disconnected |

---

## Environment Variables

### Backend (`project-pair-backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 5000) |
| `DB_HOST` | MySQL host (default localhost) |
| `DB_NAME` | Database name |
| `DB_USER` | MySQL username |
| `DB_PASS` | MySQL password |
| `JWT_SECRET` | Secret key for JWT signing |
| `CLIENT_URL` | Frontend URL for CORS |

### Frontend (`project-pair-frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## Health Check

```
GET http://localhost:5000/health
```

Returns server status, DB connection state, and online user count.
