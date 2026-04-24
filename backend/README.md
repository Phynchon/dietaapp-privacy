# DietaApp Backend (MySQL)

## 1. Install

1. Open terminal in backend folder.
2. Run:

```bash
npm install
```

## 2. Configure

1. Copy `.env.example` to `.env`.
2. Set MySQL credentials for local or Hostinger.

Quick presets available:
- `.env.local.example` for local MySQL testing.
- `.env.hostinger.example` for Hostinger deployment.

Required variables:
- `PORT`
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`
- `CORS_ORIGIN`

For local backend testing with a remote Hostinger DB, replace `MYSQL_HOST` with the remote MySQL host provided by Hostinger.

## 3. Create tables

Run SQL file:
- `sql/mysql-user-tracking-v2.sql`

## 4. Start backend

```bash
npm run dev
```

Health check:
- `GET http://localhost:4000/health`

## 5. Connect frontend

In project root `.env` set:

```bash
VITE_API_BASE_URL=http://localhost:4000
VITE_API_TIMEOUT_MS=8000
```

## 6. Endpoints

- `POST /users`
- `POST /programs`
- `PATCH /programs/:id`
- `POST /programs/:id/daily-checkins`
- `GET /programs/:id/timeline`
- `POST /consults`
- `GET /health`

## 7. Permanent deployment (recommended)

To avoid temporary tunnels and allow mobile usage outside your local network, deploy the backend to a public host (Render or Railway).

### Option A: Render (quick setup)

1. Push the project to GitHub.
2. In Render, create a new Web Service from repo.
3. Use `backend/render.yaml` (Blueprint) or configure manually:
	- Root Directory: `backend`
	- Build Command: `npm install`
	- Start Command: `npm start`
4. Set environment variables in Render dashboard:
	- `MYSQL_HOST=srv1999.hstgr.io`
	- `MYSQL_PORT=3306`
	- `MYSQL_USER=u415738498_Phynchon`
	- `MYSQL_PASSWORD=...`
	- `MYSQL_DATABASE=u415738498_Textos`
	- `MYSQL_CONNECTION_LIMIT=10`
	- `CORS_ORIGIN=http://localhost:4173,http://localhost,capacitor://localhost,https://your-frontend-domain.com`
5. After deploy, open:
	- `https://your-backend-domain.com/health`

Expected response:

```json
{"ok":true,"db":"up"}
```

### Connect frontend to fixed backend URL

1. In project root, create `.env.production` from `.env.production.example`.
2. Set:

```bash
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_API_TIMEOUT_MS=8000
```

3. Rebuild and redeploy mobile app:

```bash
npm run build
npx cap run android
```
