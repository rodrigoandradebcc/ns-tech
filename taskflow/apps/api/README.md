# TaskFlow Pro — API

NestJS REST API for the TaskFlow Pro kanban application.

## Stack

| | |
|---|---|
| Framework | NestJS v11 |
| ORM | Prisma v6 |
| Database | SQLite (dev) |
| Auth | JWT via Passport + bcryptjs |
| Validation | class-validator + ValidationPipe |

---

## Architecture

The API follows NestJS's **modular architecture** — each domain is an isolated module with its own controller, service, and DTOs.

```
src/
├── main.ts                  # Bootstrap: port 3333, global prefix /api, ValidationPipe, HttpExceptionFilter
├── app.module.ts            # Root module — imports all feature modules
│
├── auth/                    # Authentication domain
│   ├── auth.controller.ts   # POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
│   ├── auth.service.ts      # register (bcrypt hash), login (bcrypt compare + JWT sign)
│   ├── auth.module.ts
│   ├── jwt.strategy.ts      # Passport JWT strategy — validates Bearer token, loads user from DB
│   ├── jwt-auth.guard.ts    # Guard applied to protected routes
│   ├── decorators/
│   │   └── current-user.decorator.ts  # @CurrentUser() — extracts user from request
│   └── dto/
│       ├── login.dto.ts     # email, password
│       └── register.dto.ts  # name, email, password
│
├── tasks/                   # Task domain
│   ├── tasks.controller.ts  # CRUD + archive — all routes under JwtAuthGuard
│   │                        #   GET    /api/tasks
│   │                        #   POST   /api/tasks
│   │                        #   PATCH  /api/tasks/:id
│   │                        #   DELETE /api/tasks/:id
│   │                        #   POST   /api/tasks/:id/archive
│   ├── tasks.service.ts     # Business logic — filters tasks by authenticated user
│   ├── tasks.module.ts
│   └── dto/
│       ├── create-task.dto.ts   # title, description?, status, priority, tags, dueDate?
│       ├── update-task.dto.ts   # all fields optional (PartialType)
│       └── reorder-task.dto.ts  # order field for fractional indexing
│
├── users/                   # User profile domain
│   ├── users.controller.ts  # PATCH /api/users/me — protected
│   ├── users.service.ts     # updateProfile — validates email uniqueness
│   ├── users.module.ts
│   └── dto/
│       └── update-user.dto.ts  # name?, email?, avatarUrl?, bio?
│
├── prisma/                  # Prisma integration
│   ├── prisma.service.ts    # PrismaClient singleton with onModuleInit connect
│   └── prisma.module.ts     # Global module — exported for all feature modules
│
└── common/
    └── filters/
        └── http-exception.filter.ts  # Normalises all error responses to { statusCode, message, error }
```

### Request lifecycle

```
Request
  → JwtAuthGuard (validates Bearer token via JwtStrategy)
  → Controller (route handler)
  → ValidationPipe (validates DTO shape via class-validator)
  → Service (business logic)
  → PrismaService (database)
  → Response
```

### Data model

```
User
  id        String   (cuid)
  name      String
  email     String   (unique)
  password  String   (bcrypt hash)
  avatarUrl String?
  bio       String?
  tasks     Task[]
  createdAt DateTime
  updatedAt DateTime

Task
  id          String      (cuid)
  title       String
  description String?
  status      TaskStatus  (BACKLOG | IN_PROGRESS | REVIEW | DONE | ARCHIVED)
  priority    Priority    (LOW | MEDIUM | HIGH | URGENT)
  tags        String[]
  order       Float       (fractional indexing for drag-and-drop ordering)
  dueDate     DateTime?
  userId      String      (FK → User)
  createdAt   DateTime
  updatedAt   DateTime
```

---

## Scripts

```bash
pnpm start:dev          # Development with watch
pnpm start:prod         # Production

pnpm db:seed            # Seed demo users and tasks
pnpm db:reset           # Reset migrations + re-seed

pnpm prisma migrate dev         # Create and apply new migration
pnpm prisma migrate deploy      # Apply pending migrations (production)
pnpm prisma studio              # Open Prisma visual editor
sqlite3 prisma/dev.db .dump > backup.sql   # Dump database
```

---

## Environment

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET=dev-secret-change-me
PORT=3333                        # optional, defaults to 3333
```
