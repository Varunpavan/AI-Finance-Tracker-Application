# AI-Powered Finance Tracker

Full-stack MERN app: React (Vite) + Redux Toolkit on the frontend, Express + MongoDB on the backend, with AI-generated finance insights (OpenAI, with a deterministic heuristic fallback when no API key is set).

## Structure

```
server/   Express API (JWT auth, transactions, budget, AI insights, reports/PDF)
client/   React + Vite frontend (Redux Toolkit, Recharts, Tailwind)
```

## Running it locally

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:
- `MONGODB_URI` — your MongoDB connection string (Atlas or local)
- `JWT_SECRET` — any long random string
- `OPENAI_API_KEY` — optional; leave blank and the app uses its built-in heuristic insight engine instead

```bash
npm run dev
```

Runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api` requests to the backend.

### 3. Use it

Open `http://localhost:5173`, sign up, add a few transactions, set a budget, then check the Dashboard, Insights, and Reports pages.
