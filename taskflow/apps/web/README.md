# TaskFlow Pro — Web

React SPA for the TaskFlow Pro kanban application.

## Stack

| | |
|---|---|
| Bundler | Vite |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 + shadcn (base-nova) |
| State | Zustand (auth) + TanStack Query (server state) |
| Forms | React Hook Form + Zod |
| Routing | react-router-dom v7 |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Toasts | Sonner |
| HTTP | Axios |

---

## Architecture

Feature-based structure — code is co-located by domain, not by file type.

```
src/
├── main.tsx              # Entry point — mounts <App /> with QueryClientProvider
├── App.tsx               # Router setup with route groups
├── routes.tsx            # Route definitions
├── types/
│   └── index.ts          # Shared TypeScript types (Task, User, TaskStatus, Priority)
│
├── lib/
│   ├── api.ts            # Axios instance with base URL + JWT interceptor + 401 handler
│   ├── queryClient.ts    # TanStack Query client (staleTime, retry config)
│   ├── utils.ts          # cn() helper (clsx + tailwind-merge)
│   └── errors.ts         # Error parsing utilities
│
├── hooks/
│   └── use-theme.ts      # Dark/light/system theme toggle persisted in localStorage
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx       # Authenticated shell: top nav + user menu + theme toggle
│   │   ├── ProtectedRoute.tsx # Redirects to /login if no token
│   │   ├── PublicOnlyRoute.tsx# Redirects to /dashboard if already authenticated
│   │   └── ThemeToggle.tsx    # Sun/moon icon button
│   └── ui/                    # shadcn base-nova primitives (button, input, dialog, etc.)
│
├── features/
│   ├── auth/
│   │   ├── auth.api.ts        # login(), register() — POST requests to /api/auth/*
│   │   ├── auth.store.ts      # Zustand store — persists { user, token } in localStorage
│   │   └── use-auth.ts        # Hook: exposes login(), register(), logout()
│   │
│   ├── board/
│   │   ├── Board.tsx          # DnD context (PointerSensor, 8px activation) + column layout
│   │   ├── Column.tsx         # Droppable zone + task list + "+" button
│   │   ├── Card.tsx           # Task card UI — priority badge, tags, due date, actions menu
│   │   └── SortableCard.tsx   # @dnd-kit useSortable wrapper around Card
│   │
│   ├── tasks/
│   │   ├── tasks.api.ts       # getTasks(), createTask(), updateTask(), deleteTask(), archiveTask()
│   │   ├── use-tasks.ts       # TanStack Query hooks with optimistic updates
│   │   └── TaskModal.tsx      # Create/edit dialog — shared form for both modes
│   │
│   └── profile/
│       └── use-update-profile.ts  # useMutation for PATCH /api/users/me
│
└── pages/
    ├── Landing.tsx     # Public marketing page (hero, features, testimonials, pricing, FAQ)
    ├── Login.tsx       # Email + password form with apiError state
    ├── Register.tsx    # Name + email + password + confirm form
    ├── Dashboard.tsx   # Search + priority/tag filters + <Board />
    ├── Profile.tsx     # Tabbed: profile form | preferences (theme, language, notifications)
    └── NotFound.tsx    # 404 fallback
```

### Data flow

```
User action
  → React Hook Form / event handler
  → TanStack Query mutation (optimistic update applied immediately)
  → tasks.api.ts (Axios → NestJS API)
  → onSuccess: query invalidation re-fetches and reconciles
  → onError: rollback to previous cache snapshot
```

### Auth flow

```
Login form submit
  → auth.api.ts → POST /api/auth/login
  → JWT token stored in Zustand store (persisted to localStorage as taskflow:auth)
  → Axios request interceptor attaches Bearer token to every request
  → 401 response interceptor clears token and redirects to /login
    (skips /auth/* routes to allow login/register error messages to surface)
```

### Routing

| Path | Component | Guard |
|------|-----------|-------|
| `/` | Landing | PublicOnly (redirects logged-in users to /dashboard) |
| `/login` | Login | PublicOnly |
| `/register` | Register | PublicOnly |
| `/dashboard` | Dashboard | Protected |
| `/profile` | Profile | Protected |
| `*` | NotFound | — |

---

## Scripts

```bash
pnpm dev        # Start dev server at http://localhost:5173
pnpm build      # Production build to dist/
pnpm preview    # Preview production build locally
```
