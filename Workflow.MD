# TaskFlow Pro — Playbook de Prompts

Sequência de prompts para Claude Code / Cursor. Execute na ordem — cada um pressupõe o anterior.

**Regras gerais (cole no system prompt ou na primeira mensagem da sessão):**

```
Você é meu pair programmer neste case técnico (1 dia, single-dev).

Princípios não-negociáveis:
- Simples > complexo. Se houver dúvida entre duas abordagens, escolha a mais direta.
- Não introduza dependências, abstrações, camadas ou padrões que eu não pedi explicitamente.
- Não sugira Docker, CI/CD, monorepo tooling (Turbo/Nx), Storybook, Husky, commitlint, lint-staged.
- Não escreva testes a menos que eu peça especificamente.
- Não crie wrappers genéricos "para o caso de no futuro precisar".
- Antes de propor algo que aumente escopo, pergunte.
- Quando eu pedir código, entregue código completo e funcional, não pseudocódigo.
- Output em português brasileiro nos comentários/docs. Código em inglês.
```

---

## Prompt 0 — Setup inicial do monorepo

```
Crie a estrutura inicial do projeto TaskFlow Pro.

Estrutura desejada:
taskflow/
├── apps/
│   ├── api/          # NestJS + Prisma + SQLite
│   └── web/          # Vite + React + TS
├── package.json      # workspace root (pnpm)
├── pnpm-workspace.yaml
├── .gitignore
├── .nvmrc            # node 20
└── README.md         # placeholder com seções a preencher

Tarefas:
1. Inicializar pnpm workspace na raiz
2. Em apps/api: nest new api --package-manager pnpm --strict
3. Em apps/web: pnpm create vite web --template react-ts
4. Configurar .gitignore raiz cobrindo node_modules, dist, .env, *.db, *.db-journal
5. README com placeholders: Stack, Setup, Decisões, Trade-offs

Não instale nada além disso ainda. Não configure ESLint/Prettier customizados — use os defaults dos templates.
```

---

## Prompt 1 — Backend: Prisma + schema + seed

```
Configure Prisma + SQLite no apps/api e crie o schema do banco.

Tarefas:
1. Instalar prisma, @prisma/client, ts-node (dev)
2. npx prisma init com SQLite (DATABASE_URL="file:./dev.db")
3. Criar schema conforme abaixo
4. Criar prisma/seed.ts com 2 usuários e 15 tarefas distribuídas pelas colunas
5. Adicionar script "db:seed" e "db:reset" no package.json
6. Configurar Prisma seed no package.json ("prisma": { "seed": "..." })

Schema:

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  avatarUrl String?
  bio       String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tasks     Task[]
}

model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  status      String    // BACKLOG | IN_PROGRESS | REVIEW | DONE | ARCHIVED
  priority    String    // LOW | MEDIUM | HIGH | URGENT
  tags        String    @default("[]") // JSON string
  dueDate     DateTime?
  order       Int
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  archivedAt  DateTime?

  @@index([userId, status])
}

Seed:
- Usuários: rod@taskflow.dev / 123456789, demo@taskflow.dev / 123456789 (hashear com bcrypt, salt 10)
- 15 tarefas pro usuário rod, distribuídas: 5 BACKLOG, 4 IN_PROGRESS, 3 REVIEW, 3 DONE
- Títulos e descrições realistas em PT-BR (contexto: dev fullstack trabalhando em um SaaS)
- Variar prioridades, tags e dueDates (algumas no passado, no futuro, sem)
- Campo order: 1024, 2048, 3072... (espaçado pra reordenação simples)

Rode npx prisma migrate dev --name init e npx prisma db seed ao final.
```

---

## Prompt 2 — Backend: módulo Auth

```
Implemente o módulo de autenticação no NestJS.

Dependências a instalar:
@nestjs/jwt @nestjs/passport passport passport-jwt
bcrypt class-validator class-transformer
@types/bcrypt @types/passport-jwt (dev)

Estrutura:
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   ├── jwt-auth.guard.ts
│   ├── dto/
│   │   ├── register.dto.ts
│   │   └── login.dto.ts
│   └── decorators/
│       └── current-user.decorator.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
└── main.ts

Endpoints:
POST /auth/register  → { name, email, password } → { token, user }
POST /auth/login     → { email, password } → { token, user }
GET  /auth/me        → (auth) → user

Requisitos:
- ValidationPipe global em main.ts (whitelist: true, forbidNonWhitelisted: true, transform: true)
- bcrypt salt 10
- JWT secret via env (.env: JWT_SECRET=dev-secret-change-me), expiração 24h
- JWT payload: apenas { sub: userId } — não inclua email/role
- Login deve retornar erro genérico "Credenciais inválidas" tanto para email inexistente quanto senha errada (RNF: não vazar se email existe)
- DTOs com class-validator: email válido, senha mín 8 chars, name mín 2 chars
- User retornado nunca inclui password (use Prisma select ou Omit)
- CORS habilitado pra http://localhost:5173 em main.ts
- Prefix global "/api" em main.ts
- Porta 3333

Crie também um filtro global de exceções básico que padronize { statusCode, message, timestamp, path } e mascare mensagens de erro do Prisma (não vazar nomes de campos do banco).

Não implemente: refresh token, logout no servidor, recuperação de senha, OAuth.
```

---

## Prompt 3 — Backend: módulo Tasks

```
Implemente o módulo de Tasks.

Estrutura:
src/tasks/
├── tasks.module.ts
├── tasks.controller.ts
├── tasks.service.ts
└── dto/
    ├── create-task.dto.ts
    ├── update-task.dto.ts
    └── reorder-task.dto.ts

Endpoints (todos protegidos por JwtAuthGuard):
GET    /api/tasks                → Task[] do usuário, exclui status=ARCHIVED, ordenado por status + order
POST   /api/tasks                → cria, retorna Task
PATCH  /api/tasks/:id            → atualiza qualquer campo (parcial), retorna Task
DELETE /api/tasks/:id            → hard delete, 204
POST   /api/tasks/:id/archive    → seta archivedAt + status=ARCHIVED, retorna Task

DTOs:
- CreateTaskDto: title (min 3), description?, status (enum), priority (enum), tags (string[]), dueDate?, order?
- UpdateTaskDto: PartialType de Create, todos opcionais
- Validar que dueDate, se enviada, não pode ser no passado (validador customizado ou no service)

Service:
- Sempre filtrar por userId em todas as queries (multi-tenancy básica)
- Tags: receber string[] do DTO, persistir como JSON.stringify, retornar parseado
- Crie um helper privado serializeTask(task) que converte tags string→array antes de retornar
- Em POST, se order não vier, calcular como max(order) + 1024 da coluna alvo
- Em PATCH com mudança de status sem order, colocar no fim da nova coluna (max + 1024)
- Lançar NotFoundException se task não pertence ao userId
- Tags deve aceitar array vazio

Não implemente: filtros server-side (são client-side, RF11), paginação, batch update.
```

---

## Prompt 4 — Frontend: setup base

```
Configure o app web (apps/web) com a stack de UI.

Instalar:
- tailwindcss postcss autoprefixer (dev)
- react-router-dom
- @tanstack/react-query @tanstack/react-query-devtools
- axios
- zustand
- react-hook-form @hookform/resolvers zod
- lucide-react
- sonner
- clsx tailwind-merge

Configurar:
1. Tailwind: npx tailwindcss init -p, content cobrindo ./src/**/*.{ts,tsx}
2. Instalar shadcn/ui: pnpm dlx shadcn@latest init (cor neutral, CSS variables sim, tailwind.config.js, baseColor neutral, alias @/*)
3. Adicionar componentes shadcn iniciais: button, input, label, card, dialog, dropdown-menu, sonner, badge, avatar, skeleton
4. Configurar path alias @/* em tsconfig.json e vite.config.ts (precisa de @types/node e import path)
5. Criar src/lib/api.ts: axios instance com baseURL http://localhost:3333/api, interceptor de request adicionando Bearer do localStorage, interceptor de response que em 401 limpa token e redireciona pra /login
6. Criar src/lib/queryClient.ts com QueryClient (defaultOptions: queries: { retry: 1, staleTime: 30_000 })
7. Wrapper em src/main.tsx: QueryClientProvider + BrowserRouter + Toaster (sonner) + ReactQueryDevtools
8. src/index.css: importar tailwind base/components/utilities, definir CSS vars do shadcn

Estrutura de pastas:
src/
├── pages/          # Landing, Login, Register, Dashboard, Profile, NotFound
├── features/
│   ├── auth/
│   ├── tasks/
│   └── board/
├── components/
│   ├── ui/         # shadcn
│   └── layout/     # Navbar, AppShell
├── lib/
├── hooks/
├── types/
└── routes.tsx

Crie src/types/index.ts com:
- User { id, email, name, avatarUrl?, bio?, createdAt, updatedAt }
- TaskStatus = 'BACKLOG' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'ARCHIVED'
- TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
- Task { id, title, description?, status, priority, tags: string[], dueDate?, order, userId, createdAt, updatedAt, archivedAt? }

Não configure ESLint custom rules, husky, prettier separado. Não adicione i18n.
```

---

## Prompt 5 — Frontend: rotas + auth store + ProtectedRoute

```
Implemente roteamento e estado global de auth.

src/features/auth/auth.store.ts (zustand):
- estado: { user: User | null, token: string | null }
- ações: setAuth(user, token), clearAuth()
- persist em localStorage com key "taskflow:auth"

src/features/auth/auth.api.ts:
- register(data): POST /auth/register
- login(data): POST /auth/login
- me(): GET /auth/me

src/features/auth/use-auth.ts:
- hook que retorna { user, token, isAuthenticated, login, register, logout }
- login/register: chamam api, setAuth, navigate('/dashboard')
- logout: clearAuth, navigate('/')

src/components/layout/ProtectedRoute.tsx:
- Se !isAuthenticated → <Navigate to="/login" replace />
- Caso contrário, renderiza <Outlet />

src/components/layout/PublicOnlyRoute.tsx:
- Se isAuthenticated → <Navigate to="/dashboard" replace />
- Caso contrário, <Outlet />

src/routes.tsx:
- / → Landing (público)
- /login → Login (PublicOnly)
- /register → Register (PublicOnly)
- /dashboard → Dashboard (Protected)
- /profile → Profile (Protected)
- * → NotFound

Crie shells vazios (placeholder) das pages com um <h1> só, vamos preencher depois.

Importante: opcionalmente, ao montar o app, se houver token mas não user, chamar /auth/me pra validar — se 401, limpa. Se não quiser complicar, confie no localStorage e deixe o interceptor lidar com 401.
```

---

## Prompt 6 — Frontend: Landing page (US01 + US02)

```
Implemente a landing page em src/pages/Landing.tsx.

Seções (em ordem):
1. Navbar fixa (sticky, blur background): logo "TaskFlow Pro" + links âncora (Features, Preços, FAQ) + botão "Entrar" (→ /login) + CTA "Começar grátis" (→ /register)
2. Hero: headline forte em PT-BR sobre Kanban simples pra times pequenos, subheadline, 2 CTAs (Cadastrar grátis / Ver demo). Pode ter um mockup SVG/imagem decorativa à direita em desktop.
3. Features (3 cards com ícones lucide): "Kanban em 30s", "Colaboração simples", "Foco no que importa". Descrições curtas.
4. Depoimentos (3 cards com avatar fictício, nome, cargo, frase)
5. Pricing (3 cards): Free / Pro (destacado, "Mais popular") / Enterprise — com bullets do PRD
6. FAQ (5 perguntas em accordion — adicionar componente accordion do shadcn)
7. Footer: copyright, links mock (Termos, Privacidade), input de newsletter (mock — onSubmit mostra toast "Inscrição mock — sem backend")

Requisitos:
- Scroll suave: <a href="#features"> com html { scroll-behavior: smooth } no CSS
- Responsivo desde 320px — usar grid/flex Tailwind (md:, lg:)
- Dark mode funcionando (classe "dark" no html, mas ainda sem toggle — virá no Profile)
- Tipografia: importar Inter via @fontsource ou Google Fonts no index.html
- Headlines com peso forte (font-bold ou font-semibold), tracking ajustado
- SEO básico: editar index.html com <title>, <meta description>, OpenGraph (RF02)
- Sem dados reais — depoimentos fictícios e claros como tal

Adicione shadcn accordion: pnpm dlx shadcn@latest add accordion

Estilo: minimalista, inspirado em Linear.app — paleta neutra com 1 cor de destaque (sugiro azul-violeta ou um verde discreto), espaçamento generoso, sem gradientes pesados.
```

---

## Prompt 7 — Frontend: Login + Register (US03 + US04)

```
Implemente as páginas de Login e Register.

src/pages/Login.tsx:
- Layout centrado, card shadcn, mesma navbar pública (sem links âncora) ou navbar mínima só com logo
- Form com react-hook-form + Zod resolver
- Schema: email (z.string().email()), password (z.string().min(8))
- Campos: email, password, checkbox "lembrar-me" (mock, sem efeito)
- Validação em tempo real (mode: 'onBlur')
- Botão "Entrar" com estado loading (disabled + spinner lucide)
- Em erro da API: mostrar inline acima do form (não toast pra erro de credenciais)
- Link "Esqueci a senha" → onClick mostra toast.info("Funcionalidade em breve")
- Link "Não tem conta? Cadastre-se" → /register

src/pages/Register.tsx:
- Mesma estrutura
- Schema: name (min 2), email (válido), password (min 8), confirmPassword (igual password via .refine)
- Mensagens de erro claras inline por campo
- Em erro 409 (email duplicado): inline no campo email
- Após sucesso: useAuth.register já redireciona pra /dashboard

Componentes auxiliares (criar em src/components/ui/ se não existirem):
- FormField que recebe label, error, children — encapsula label + input + erro
- Ou use o pattern do shadcn/form (Form, FormControl, FormField, FormItem, FormLabel, FormMessage) — pnpm dlx shadcn@latest add form

Critérios de aceite:
- Submit desabilitado enquanto isPending
- Erro de rede genérico tratado (toast.error com mensagem amigável, RNF11)
- Acessibilidade: labels associadas, autoComplete adequado (email, current-password, new-password)
```

---

## Prompt 8 — Frontend: AppShell + Navbar autenticada

```
Crie o layout do app autenticado.

src/components/layout/AppShell.tsx:
- Container que envolve todas as rotas protegidas
- Navbar fixa no topo com:
  - Logo "TaskFlow Pro" (link → /dashboard)
  - Espaço (futuro: switcher de projetos / busca)
  - Toggle dark mode (componente separado, abaixo)
  - DropdownMenu do avatar do user:
    - Cabeçalho com nome + email
    - Item "Perfil" → /profile
    - Item "Sair" → useAuth.logout()
- Children renderizado em <main> com padding adequado

src/components/layout/ThemeToggle.tsx:
- Botão ícone (sol/lua de lucide)
- Lê tema de localStorage["taskflow:theme"], default "system"
- Aplica classe "dark" no <html> conforme tema atual ou prefers-color-scheme
- Hook useTheme em src/hooks/use-theme.ts

Aplicar AppShell em routes.tsx envolvendo as rotas protegidas:
<Route element={<ProtectedRoute />}>
  <Route element={<AppShell />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<Profile />} />
  </Route>
</Route>

Critério de aceite:
- Logout limpa store e redireciona pra /
- Avatar fallback com inicial do nome se não houver avatarUrl
- Dropdown fecha ao clicar em item
- Dark mode persiste após F5
```

---

## Prompt 9 — Frontend: Board (US06) — sem DnD ainda

```
Implemente o Kanban board em src/pages/Dashboard.tsx — primeiro sem drag & drop, garantindo que tudo carrega e renderiza.

src/features/tasks/tasks.api.ts:
- list(): GET /tasks → Task[]
- create(data), update(id, data), remove(id), archive(id)

src/features/tasks/use-tasks.ts:
- useTasks() → useQuery(['tasks'], api.list)
- useCreateTask(), useUpdateTask(), useDeleteTask(), useArchiveTask() — todas com optimistic update padrão (pattern abaixo)

Pattern de mutation com optimistic:
const useUpdateTask = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.update(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ['tasks'] })
      const prev = qc.getQueryData<Task[]>(['tasks'])
      qc.setQueryData<Task[]>(['tasks'], (old) =>
        old?.map(t => t.id === id ? { ...t, ...data } : t)
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      qc.setQueryData(['tasks'], ctx?.prev)
      toast.error('Não foi possível atualizar')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

src/features/board/Board.tsx:
- Recebe tasks: Task[]
- Renderiza 4 colunas em grid responsivo (1 coluna mobile, 2 tablet, 4 desktop) — em mobile permitir scroll horizontal
- Status fixos: BACKLOG, IN_PROGRESS, REVIEW, DONE
- Filtra ARCHIVED do array

src/features/board/Column.tsx:
- Header com nome da coluna + contador (badge)
- Botão "+" no header pra criar tarefa nessa coluna (abre modal — virá no próximo prompt, por ora deixar console.log)
- Lista de Cards ordenada por order asc
- Estado vazio: texto cinza "Nenhuma tarefa"

src/features/board/Card.tsx:
- Mostra: title, description (max 2 linhas com line-clamp-2), priority (cor: cinza/azul/laranja/vermelho), tags (badges), avatar do assignee, dueDate formatado (date-fns ou Intl)
- DueDate em vermelho se passada, amarelo se hoje/amanhã
- Menu 3-dots (DropdownMenu): Editar, Arquivar, Excluir
- onClick no card abre edição (futuro)

Estados:
- Loading: skeleton de 4 colunas com 2 cards cinza
- Empty (zero tasks no total): empty state amigável com botão "Criar primeira tarefa"
- Error: mensagem amigável + botão "Tentar novamente" que faz refetch

Não implemente DnD ainda. Deixe placeholders nos handlers.
```

---

## Prompt 10 — Frontend: TaskModal (US07 + US08)

```
Implemente o modal de criar/editar tarefa.

src/features/tasks/TaskModal.tsx:
- Dialog do shadcn
- Props: open, onOpenChange, task?: Task (se passada, modo edição), defaultStatus?: TaskStatus
- Form react-hook-form + Zod

Schema:
const taskSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres'),
  description: z.string().optional(),
  status: z.enum(['BACKLOG', 'IN_PROGRESS', 'REVIEW', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  tags: z.array(z.string()).default([]),
  dueDate: z.date().optional().refine(d => !d || d >= startOfToday(), 'Data não pode ser passada'),
})

Campos:
- Título (Input)
- Descrição (Textarea, autosize ou rows=4)
- Status (Select)
- Prioridade (Select com cores no item)
- Tags (input de texto que aceita Enter pra adicionar, mostra chips abaixo, X pra remover — componente custom simples, sem libs)
- Due date (DatePicker do shadcn — pnpm dlx shadcn@latest add calendar popover, e usar react-day-picker)

Comportamento:
- Modo criação: título vazio, status = defaultStatus ?? 'BACKLOG', priority = 'MEDIUM'
- Modo edição: preenche com task atual
- Botão primário: "Criar" ou "Salvar"
- Em edição, botão secundário "Arquivar" (chama useArchiveTask, fecha modal, toast)
- Loading state no submit
- Validação inline por campo
- Após sucesso: fecha modal, toast.success

Conectar:
- Em Column.tsx: estado local openCreateModal + defaultStatus
- Em Card.tsx: onClick abre modal em modo edição
- Indicador visual "salvando..." / "salvo" durante mutation (no header do modal ou perto do botão)

Acessibilidade: focus no primeiro campo ao abrir, ESC fecha, click fora fecha.
```

---

## Prompt 11 — Frontend: Drag & Drop com @dnd-kit (RF09 + US06)

```
Adicione drag & drop ao board com @dnd-kit.

Instalar: @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

Padrão a seguir: o exemplo oficial "Multiple Containers" — não invente solução própria.

src/features/board/Board.tsx:
- Envolver tudo em <DndContext sensors={...} collisionDetection={closestCorners} onDragStart onDragOver onDragEnd>
- Sensors: PointerSensor (activationConstraint: distance: 8) + KeyboardSensor
- Estado local: activeTask: Task | null (pra DragOverlay)
- DragOverlay renderiza <Card task={activeTask} /> com sombra e leve rotação

Em cada Column:
- <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
- Os Cards filhos viram SortableItem

src/features/board/SortableCard.tsx:
- Wrapper que usa useSortable({ id: task.id, data: { type: 'task', task } })
- Aplica transform/transition de @dnd-kit/utilities
- Estado isDragging: opacidade 0.5 e cursor

src/features/board/Column.tsx:
- useDroppable({ id: status, data: { type: 'column', status } }) pra permitir drop em coluna vazia
- Highlight visual no setNodeRef com isOver

onDragEnd handler:
1. Se active.id === over.id → ignorar
2. Determinar coluna destino:
   - Se over é uma column (data.type === 'column') → status = over.id
   - Se over é um card → status = task da posição. Encontrar coluna pelo over.id
3. Calcular novo order:
   - Pegar tasks da coluna destino ordenadas
   - Se inserindo no início: order = primeiro - 1024
   - Se inserindo no fim: order = último + 1024
   - Se entre dois: order = (anterior + posterior) / 2
4. Chamar useUpdateTask({ id: active.id, data: { status, order } })
5. Optimistic update já cuida do reorder visual

Critérios de aceite (RNF12):
- Ghost card durante drag (DragOverlay)
- Highlight da coluna alvo (border ou bg sutil)
- Cursor grab/grabbing
- Drag funciona entre colunas e dentro da mesma coluna
- Após drop, ordem persiste após F5 (RF10 + métrica "Consistência Kanban após refresh: 100%")

Se ficar travado mais de 1h: fallback aceitável é remover DnD e adicionar no menu 3-dots do card opções "Mover para → [colunas]". O PRD permite isso (riscos 6.2). Mas tente primeiro.
```

---

## Prompt 12 — Frontend: Profile + Preferências (US10 + US11)

```
Implemente página de perfil e preferências.

src/pages/Profile.tsx:
- Layout: 2 colunas em desktop (form à esquerda, preview/info à direita), 1 coluna mobile
- Tabs do shadcn: "Perfil" e "Preferências"

Tab Perfil:
- Form react-hook-form + Zod
- Campos: name (min 2), email (válido), avatarUrl (URL opcional), bio (textarea, max 200)
- Validação de email único: tratar erro 409 do backend inline
- Botão "Salvar" com loading
- Toast de sucesso após save
- Preview do avatar atualizado em tempo real conforme digita avatarUrl

Tab Preferências:
- Toggle "Tema" (3 opções: claro / escuro / sistema) — usar RadioGroup do shadcn
- Toggle "Idioma": apenas PT-BR habilitado, EN-US disabled com tooltip "Em breve" (mock)
- Toggle "Notificações por email": switch (mock, persistir em localStorage taskflow:prefs)
- Sem botão salvar — toggles persistem on change com toast.success("Preferências atualizadas")

Backend:
- Já criamos PATCH /users/me? Se não, adicione agora:
  - Em apps/api: novo módulo users com UsersController + UsersService
  - PATCH /users/me protegido, recebe { name?, email?, avatarUrl?, bio? }
  - Se email mudou, validar unicidade (lançar 409 se duplicado)
  - Retorna user atualizado (sem password)
- No frontend, atualizar useAuth store após save bem-sucedido
```

---

## Prompt 13 — Polish final

```
Passada de qualidade no produto. Vá item por item:

1. Loading states (RNF10):
   - Toda mutation tem botão disabled + spinner durante isPending
   - Toda query tem skeleton apropriado
   - Não deixar tela em branco em momento algum

2. Error handling (RNF11):
   - Criar src/lib/errors.ts com função getErrorMessage(error) que extrai mensagem amigável de erros do axios
   - Substituir toda exibição de erro raw por essa função
   - Erros conhecidos (401, 403, 404, 409, 422, 500) → mensagens em PT-BR claras

3. Responsividade (RNF08):
   - Testar em 320px, 768px, 1024px, 1920px
   - Board em mobile: scroll horizontal nas colunas OU stack vertical (escolha uma)
   - Modais em mobile: full screen ou padding reduzido
   - Navbar em mobile: menu hambúrguer com Sheet do shadcn (pnpm dlx shadcn@latest add sheet)

4. Empty states:
   - Board vazio (zero tasks): ilustração simples (SVG inline) + CTA
   - Coluna vazia: texto cinza + dica
   - Após filtro retornar 0: mensagem específica

5. Filtros client-side (RF11):
   - Adicionar barra acima do board: filtro por prioridade (multi-select chips), filtro por tag (search + chips)
   - Implementar com useMemo derivado de tasks
   - Botão "Limpar filtros" se algum ativo
   - Contador "Mostrando X de Y tarefas"

6. SEO/meta (RF02):
   - Cada página com title via useEffect setando document.title (ou react-helmet-async se quiser)
   - index.html com og:title, og:description, og:image (placeholder)

7. Acessibilidade básica:
   - Contraste WCAG AA em dark e light
   - Navegação por teclado em modal e dropdown
   - aria-label em botões só com ícone

8. README.md final:
   - Stack
   - Setup (pnpm install, criar .env, prisma migrate, seed, pnpm dev)
   - Decisões técnicas (3-5 bullets curtos: por que SQLite, por que dnd-kit, por que sem refresh token)
   - Trade-offs assumidos (o que ficou de fora e por quê)
   - Credenciais do seed pra testar
   - Screenshots opcionais

Critério: rodar Lighthouse na landing — meta FCP < 1.5s (RNF01).
```

---

## Prompt 14 — (OPCIONAL) Bônus se sobrar tempo

Use só se passou no checkpoint das 7h com tudo acima funcionando. Senão, ignore.

```
Implemente UM dos bônus abaixo (escolha o que destrava mais valor pro avaliador):

Opção A — Multi-projetos (US12):
- Adicionar tabela Project no Prisma
- Task ganha projectId
- Sidebar com lista de projetos + criar projeto
- Switcher no AppShell mantendo last-selected em localStorage
- Esforço: ~1.5h

Opção B — Analytics (US13):
- Página /analytics (rota protegida)
- Cards: total tasks, taxa conclusão, atrasadas, completadas no período
- Gráfico de barras (recharts) por status
- Filtro 7/30/sempre — frontend, derivado do array de tasks
- Esforço: ~1h

Opção C — Vitest mínimo:
- 3 testes em auth.service: hash, valida senha correta, rejeita errada
- 2 testes em tasks.service: filtro por user, soft archive
- Esforço: ~45min

Recomendação: B (analytics) é a mais "demo-friendly" — mostra resultado visual rápido pro avaliador. C mostra disciplina mas é menos vistoso. A é a maior, mais arriscada.
```

---

## Como usar este playbook

1. Abra Claude Code (ou Cursor) na raiz do projeto.
2. Cole as **Regras gerais** no início da sessão.
3. Cole **um prompt por vez**, sem pular. Espere completar, revise o diff, ajuste, commit.
4. Após cada prompt, rode o app e teste manualmente o que foi adicionado antes de seguir.
5. Se algo der errado, **não cole o próximo prompt** — corrija o atual primeiro.
6. Cronometro: se chegar nas 6h e não estiver no Prompt 11 finalizado, pule polish e vai direto pro essencial. Bônus só se Prompt 13 fechou com sobra real.

## Checkpoints de cronograma

- **2h**: Prompts 0–3 prontos (backend completo)
- **4h**: Prompts 4–7 prontos (auth + landing + login)
- **6h**: Prompts 8–11 prontos (board com DnD funcionando)
- **7h**: Prompts 12–13 prontos (profile + polish)
- **8h+**: Prompt 14 ou descanso/buffer

Se atrasar em qualquer ponto, **corte profile (Prompt 12) ou bônus (14) — nunca corte polish (13)**. Avaliador percebe mais a falta de polish do que a ausência de uma feature.
