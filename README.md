# Improve My City — Full Stack Scaffold (React + Node/Express + MongoDB)

This canvas contains a **runnable scaffold** with:

- **Frontend**: React + Vite + Tailwind, public landing (national view), **Authority login** entry (top-right), and basic screens.
- **Backend**: Node + Express + TypeScript + Mongoose, RBAC for **Developer Admin** vs **Authority Admin**, complaint CRUD, duplicate check hooks, **merge API**, and status engines (stalled/revived/resolved).
- **Shared Semantics** aligned to our whiteboard spec (Stalled/Revived, Holds, No-Progress cadence, EXIF validation stubs).

> Notes:
>
> - Replace placeholders like `YOUR_MONGO_URI`, `JWT_SECRET`, and `DEV_ADMIN_KEY` in `.env`.
> - EXIF + image storage are stubbed behind interfaces so we can swap implementations.

---

## README.md (quick start)

```md
# Improve My City — Quick Start

## Prereqs

- Node 20+
- MongoDB running locally

## Backend

cd backend
cp ../.env.example .env # edit values
npm i
npm run dev

## Frontend

cd ../frontend
npm i
npm run dev

Open http://localhost:5173

- Landing shows national metrics
- Authority login at /authority/login
- Overdue queues visible post-login

## Developer Admin

Call POST http://localhost:4000/api/developer/jobs/overdue-sweep with header `x-dev-key: DEV_ADMIN_KEY`
```
