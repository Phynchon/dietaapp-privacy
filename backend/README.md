# DietaApp Backend (MySQL)

## 1. Install

1. Open terminal in backend folder.
2. Run:

```bash
npm install
```

## 2. Configure

The backend now uses explicit env files by mode:
- Development (default): `.env.development`
- Production: `.env.production`

Fallback:
- `.env` is still loaded as fallback for missing vars.

Recommended setup:
1. Put local MySQL values in `.env.development`.
2. Put remote/production values in `.env.production`.
3. Keep `NODE_ENV=production` in deployment.

Required variables:
- `PORT`
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`
- `CORS_ORIGIN`

For local backend testing with a remote Hostinger DB, set those values in `.env.development`.

## 3. Create tables

Run SQL file:
- `sql/mysql-user-tracking-v2.sql`

If the database already exists, run migration too:
- `sql/mysql-user-tracking-baseapp-migration.sql`

### 3.1 Plan columns migration (Week 2)

To ensure `users.user_plan` and `users.plan_updated_at` exist in the active DB:

```bash
npm run migrate:user-plan
```

Expected output includes:
- `userPlan` as `applied` or `already-exists`
- `planUpdatedAt` as `applied` or `already-exists`
- `columns` containing both `user_plan` and `plan_updated_at`

## 4. Start backend

```bash
npm run dev
```

Health check:
- `GET http://localhost:4000/health`

### 4.1 Plan API smoke test

With backend running, validate `POST /users` + `GET/PUT /users/:id/plan` end-to-end:

```bash
npm run test:plan-endpoints
```

Expected flow:
- `postUserStatus: 201`
- `getBeforeStatus: 200` with `plan: "free"`
- `putStatus: 200` with `plan: "premium"`
- `getAfterStatus: 200` with `plan: "premium"` and non-null `planUpdatedAt`

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

## 6.1 Admin web (private)

Private stats dashboard route:
- `GET /admin`

Admin API route used by dashboard:
- `GET /admin/api/overview`

Both routes are protected with HTTP Basic Auth using:
- `ADMIN_USER`
- `ADMIN_PASSWORD`

Development fallback:
- If `NODE_ENV` is not `production` and those vars are missing, backend uses temporary defaults:
	- user: `admin`
	- password: `admin`
- In production, `ADMIN_USER` and `ADMIN_PASSWORD` are mandatory.

Example:
1. Start backend.
2. Open `http://localhost:4000/admin`.
3. Enter admin credentials when browser asks.

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
	- `MYSQL_USER=u415738498_Martorell`
	- `MYSQL_PASSWORD=...`
	- `MYSQL_DATABASE=u415738498_BaseApp`
	- `MYSQL_CONNECTION_LIMIT=10`
	- `CORS_ORIGIN=http://localhost:4173,http://localhost,https://localhost,capacitor://localhost,https://your-frontend-domain.com`
	- `ADMIN_USER=...`
	- `ADMIN_PASSWORD=...`
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
