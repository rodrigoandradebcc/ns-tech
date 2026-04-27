# TaskFlow Pro

> Study project / portfolio piece — NsTech coursework

A fullstack Kanban task manager with drag-and-drop, JWT auth, and a responsive UI.

---

## Stack

| Layer    | Technology                                                                                                  |
|----------|-------------------------------------------------------------------------------------------------------------|
| Frontend | Vite + React 19 + TypeScript + Tailwind v4 + shadcn (base-nova) + @dnd-kit + TanStack Query + React Hook Form + Zod + react-router-dom + Sonner |
| Backend  | NestJS v11 + Prisma v6 + SQLite + class-validator + JWT (Passport)                                          |
| Monorepo | pnpm workspaces                                                                                             |

---

## Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repo-url> taskflow
   cd taskflow
   pnpm install
   ```

2. **Configure the API environment**

   Create `apps/api/.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET=dev-secret-change-me
   ```

3. **Run migrations and seed the database**
   ```bash
   cd apps/api
   pnpm prisma migrate deploy
   pnpm prisma db seed
   ```

4. **Start the development servers**
   ```bash
   # From the monorepo root
   pnpm dev
   ```

5. **Open the app**

   Navigate to [http://localhost:5173](http://localhost:5173)

---

## Test Credentials

```
Email:    rod@taskflow.dev
Password: 123456789
```

---

## Deploy (Production)

Hosted on a **Hostinger VPS** managed via **EasyPanel**.

| Component | Setup |
|-----------|-------|
| VPS       | Hostinger — Ubuntu 24.04 |
| Panel     | EasyPanel (Docker-based, self-hosted PaaS) |
| API       | NestJS container served via EasyPanel app |
| Web       | Static build (`pnpm build`) served via EasyPanel / Nginx |
| Database  | SQLite file persisted on the VPS volume |

### Steps to deploy

1. Build the frontend:
   ```bash
   cd apps/web && pnpm build
   ```

2. In EasyPanel, create two apps — one for the API (Node image) and one for the web (static/Nginx).

3. Set environment variables in EasyPanel for the API app:
   ```env
   DATABASE_URL="file:./prod.db"
   JWT_SECRET=<strong-random-secret>
   ```

4. On first deploy, run migrations inside the API container:
   ```bash
   npx prisma migrate deploy
   ```

---

## Technical Decisions

- **SQLite** — Zero-config persistence ideal for a study project; no infra to manage. In production, swapping to PostgreSQL requires only a Prisma datasource change.
- **@dnd-kit over react-beautiful-dnd** — RBD is unmaintained; dnd-kit is actively developed, supports pointer sensors (mobile), and allows custom collision strategies.
- **No refresh token** — Deliberately simplified auth for scope; the JWT expiry is set long enough for demo use. A real app would add refresh token rotation.
- **Optimistic updates** — TanStack Query's `onMutate`/`onError`/`onSettled` pattern gives instant feedback on all task mutations without a separate loading state.
- **Base UI (shadcn base-nova)** — Radix UI alternative with leaner bundle size; all component props follow Base UI's render prop pattern instead of `asChild`.

---

## Trade-offs

- No refresh token / token rotation (kept out of scope)
- No real-time collaboration (no WebSockets)
- No file uploads — avatar is stored as a URL string
- No email sending — notification preferences are persisted locally only
- No pagination — all tasks are loaded in a single request
- SQLite is not suitable for production-level write concurrency

---

## Project Structure

```
taskflow/
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── auth/          # JWT strategy, login, register
│   │       ├── tasks/         # Task CRUD, status, priority, tags
│   │       ├── users/         # Profile management
│   │       └── prisma/        # Prisma service + schema
│   └── web/
│       └── src/
│           ├── components/    # Shared UI components (shadcn base-nova)
│           ├── features/
│           │   ├── auth/      # Login, register forms
│           │   ├── board/     # Kanban board + @dnd-kit logic
│           │   └── profile/   # Profile edit form
│           ├── hooks/         # Shared React hooks
│           ├── lib/           # API client, query client, utils
│           └── pages/         # Route-level page components
└── package.json               # pnpm workspace root
```
