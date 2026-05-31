# TellMD

> Tell us your symptoms. We connect you to the right doctor.

TellMD is a telehealth web application for online consultations, appointment scheduling, AI-assisted doctor matching, and medical records.

## Tech stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query, Zustand
- **Backend:** Node.js, Express, TypeScript, PostgreSQL, Prisma, JWT, Socket.IO
- **Integrations:** Gemini, ZegoCloud, Cloudinary, push notifications

## Project structure

```
builder_round/
├── frontend/           # React SPA
├── backend/            # REST API + WebSockets
├── postman/            # TellMD API collection
└── TELLMD_CONTEXT.md   # Full MVP feature spec
```

## Prerequisites

- Node.js (LTS recommended)
- PostgreSQL database for the backend

## Getting started

### Backend

```bash
cd backend
npm install
npm run dev
```

Runs at `http://localhost:3000`. Database schema and migrations live in `backend/prisma/`; the API requires a working database connection before it can run.

Production: `npm run build` then `npm start`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`). API and WebSocket traffic are proxied to the backend on port 3000.

Production: `npm run build` then `npm run preview`.

## Additional docs

- [TELLMD_CONTEXT.md](TELLMD_CONTEXT.md) — feature specification (patient and doctor modules)
- [postman/](postman/) — API collection for testing endpoints
