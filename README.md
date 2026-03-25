# ProjectPair – Freelancer Pair-Buddy Platform

A premium full-stack SaaS platform connecting freelancers with complementary skills.

## Quick Start

### Frontend
```bash
cd project-pair-frontend
npm install
npm run dev        # → http://localhost:5173
```

### Backend
```bash
cd project-pair-backend
npm install
cp .env.example .env   # fill in your MySQL credentials
npm run dev        # → http://localhost:5000
```

### MySQL Setup
```bash
mysql -u root -p < project-pair-backend/schema.sql
```

## Pages
| Route | Page |
|-------|------|
| `/` | Landing (cinematic hero) |
| `/login` | Sign In |
| `/signup` | Sign Up (2-step) |
| `/projects` | Project Board + Pair Proposals |
| `/dashboard` | Kanban Dashboard |
| `/profile` | User Profile |
| `/portfolio` | Portfolio Generator |
| `/chat` | Messaging Interface |

## Tech Stack
- **Frontend**: React 19, Vite, Framer Motion, React Router, Lucide Icons
- **Backend**: Node.js, Express, Sequelize ORM
- **Database**: MySQL (relational schema with proper FK constraints)
- **Auth**: JWT + bcrypt
