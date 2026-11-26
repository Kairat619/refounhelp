# RefundHelp — Demo App

A showcase app for the **RefundHelp** business model: a refund-assistance service for online shoppers in Kazakhstan
("No Refund, No Fee").

| Layer | Tech | Deploy |
|---|---|---|
| Frontend | React 19 + Vite + TailwindCSS v4, React Router, Recharts | **Vercel** |
| Backend | FastAPI (Python 3.12) | **Railway** |
| Local | Docker Compose (nginx + uvicorn) | `localhost:8080` |

> All merchants and policies are **fictional demo data**. Data is kept in memory and resets when the backend restarts.

## What the demo shows

| Page | Business-model concept |
|---|---|
| `/` Home | Problem, value proposition (convenience, reliability, speed, affordability), how it works |
| `/policies` | **Free Self-Service**: searchable policy database (stores, airlines, hotels, subscriptions) |
| `/check` | Deadline check + ready refund message in **English / Russian**; specialist fee estimate (15% standard / 20% complex) |
| `/cases` | **Specialist Service**: escalated cases with a timeline; "Next step" simulates the specialist (≈80% success rate; failure → no fee) |
| `/pricing` | Three tiers + demo toggle for **RefundHelp Plus** (2 fee-free cases / month) |
| `/business` | Live financial model: scenarios (300/500/700 cases), break-even (≈639 cases), payback, funnel, specialist workload |

Business rules from the report (20,000 KZT minimum order, fee rates, Plus price, fixed and variable costs…) all live in
[`backend/app/business.py`](backend/app/business.py).

## Project structure

```
refundhelp-app/
├── backend/            FastAPI app  → Railway
│   ├── app/
│   │   ├── main.py         API routes
│   │   ├── business.py     pricing + financial model (single source of truth)
│   │   ├── merchants.py    demo policy database
│   │   └── letters.py      EN/RU refund message templates
│   ├── Dockerfile
│   └── railway.json
├── frontend/           React + Vite + Tailwind → Vercel
│   ├── src/pages/          Home, Policies, Check, Cases, Pricing, Business…
│   ├── Dockerfile + nginx.conf   (local Docker only)
│   └── vercel.json
└── docker-compose.yml
```

## Run locally

### Option A: Docker (recommended)

```powershell
docker compose up --build
```

- App: http://localhost:8080
- API docs (Swagger): http://localhost:8000/docs

Stop it with `docker compose down`.

### Option B: without Docker (hot reload)

```powershell
cd backend; python -m venv .venv; .venv\Scripts\pip install -r requirements.txt; .venv\Scripts\uvicorn app.main:app --reload --port 8000
```

In a second terminal:

```powershell
cd frontend; npm install; npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to `localhost:8000`.

## Deploy

Push the `refundhelp-app` folder to a GitHub repository first. Both Railway and Vercel deploy from GitHub.

### 1. Backend → Railway

1. Railway → **New Project → Deploy from GitHub repo** → pick the repository.
2. In the service **Settings → Root Directory**, set `backend`. Railway detects `railway.json` and builds the `Dockerfile`.
3. **Variables**: add
   - `ALLOWED_ORIGINS` = `https://<your-app>.vercel.app` (or `*` for a quick demo)
   - optional `ALLOWED_ORIGIN_REGEX` = `https://.*\.vercel\.app` (allows Vercel preview URLs)
4. **Settings → Networking → Generate Domain**. Copy the URL, e.g. `https://refundhelp-api.up.railway.app`.
5. Check `https://…up.railway.app/api/health` → `{"status":"ok"}`.

Railway sets `$PORT` itself; the Dockerfile already uses it. The health check uses `/api/health`.

### 2. Frontend → Vercel

1. Vercel → **Add New → Project** → import the same repository.
2. **Root Directory**: `frontend`. Framework preset: **Vite** (also set in `vercel.json`).
3. **Environment Variables**: `VITE_API_URL` = your Railway URL (no trailing slash).
4. Deploy. `vercel.json` rewrites all routes to `index.html`, so deep links like `/business` work.

If you change `VITE_API_URL` later, redeploy: Vite bakes it in at build time.

## API overview

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/plans` | Pricing tiers |
| GET | `/api/merchants?q=&category=` | Policy database search |
| GET | `/api/merchants/{id}` | Policy detail |
| POST | `/api/check` | Deadline check, recommendation, EN/RU letters, fee estimate |
| GET/POST | `/api/me`, `/api/me/plus` | Demo Plus subscription |
| POST/GET | `/api/cases`, `/api/cases/{id}` | Create / view specialist cases |
| POST | `/api/cases/{id}/advance` | Demo: simulate the next specialist step |
| GET | `/api/finance/defaults`, `/api/finance/projection` | Financial model |

There are no user accounts. Each browser gets an anonymous id (stored in `localStorage`), sent in the `X-Client-Id` header.
