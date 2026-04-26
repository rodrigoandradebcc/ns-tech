import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const salt = 10;
  const hash1 = await bcrypt.hash("123456789", salt);
  const hash2 = await bcrypt.hash("123456789", salt);

  const rod = await prisma.user.upsert({
    where: { email: "rod@taskflow.dev" },
    update: {},
    create: {
      email: "rod@taskflow.dev",
      password: hash1,
      name: "Rodrigo",
      bio: "Fullstack dev construindo um SaaS do zero.",
    },
  });

  await prisma.user.upsert({
    where: { email: "demo@taskflow.dev" },
    update: {},
    create: {
      email: "demo@taskflow.dev",
      password: hash2,
      name: "Demo",
      bio: "Conta de demonstração.",
    },
  });

  const now = new Date();
  const past = (days: number) => new Date(now.getTime() - days * 86400000);
  const future = (days: number) => new Date(now.getTime() + days * 86400000);

  const tasks = [
    // BACKLOG (5)
    {
      title: "Configurar pipeline de CI com GitHub Actions",
      description: "Rodar lint, testes e build em cada PR antes do merge.",
      status: "BACKLOG",
      priority: "MEDIUM",
      tags: JSON.stringify(["devops", "ci"]),
      dueDate: future(14),
      order: 1024,
    },
    {
      title: "Implementar refresh token com rotação",
      description: "Trocar o JWT de acesso a cada renovação para mitigar roubo de token.",
      status: "BACKLOG",
      priority: "HIGH",
      tags: JSON.stringify(["auth", "segurança"]),
      dueDate: future(7),
      order: 2048,
    },
    {
      title: "Criar tela de configurações do perfil",
      description: "Edição de nome, bio e avatar. Upload de imagem via S3.",
      status: "BACKLOG",
      priority: "LOW",
      tags: JSON.stringify(["frontend", "perfil"]),
      dueDate: null,
      order: 3072,
    },
    {
      title: "Adicionar paginação cursor-based na listagem de tarefas",
      description: "Substituir offset por cursor para performance em grandes volumes.",
      status: "BACKLOG",
      priority: "MEDIUM",
      tags: JSON.stringify(["api", "performance"]),
      dueDate: future(21),
      order: 4096,
    },
    {
      title: "Documentar API com Swagger/OpenAPI",
      description: "Decoradores NestJS para gerar spec automaticamente.",
      status: "BACKLOG",
      priority: "LOW",
      tags: JSON.stringify(["docs", "api"]),
      dueDate: null,
      order: 5120,
    },
    // IN_PROGRESS (4)
    {
      title: "Endpoint de reordenação de tarefas via drag-and-drop",
      description: "PATCH /tasks/:id/order — atualizar campo order em batch.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      tags: JSON.stringify(["api", "kanban"]),
      dueDate: future(2),
      order: 1024,
    },
    {
      title: "Integrar Prisma ao módulo de autenticação",
      description: "Substituir array em memória pelo banco SQLite real.",
      status: "IN_PROGRESS",
      priority: "URGENT",
      tags: JSON.stringify(["backend", "auth", "prisma"]),
      dueDate: past(1),
      order: 2048,
    },
    {
      title: "Board Kanban — arrastar entre colunas",
      description: "Usar @dnd-kit/core para mover cards e chamar o endpoint de reordenação.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      tags: JSON.stringify(["frontend", "kanban"]),
      dueDate: future(3),
      order: 3072,
    },
    {
      title: "Seed de dados realistas para demo",
      description: "15 tarefas distribuídas com títulos, prioridades e datas variadas.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      tags: JSON.stringify(["devex", "seed"]),
      dueDate: future(1),
      order: 4096,
    },
    // REVIEW (3)
    {
      title: "Validação de DTOs com class-validator",
      description: "Aplicar decoradores @IsString, @IsEnum etc. em todos os endpoints.",
      status: "REVIEW",
      priority: "MEDIUM",
      tags: JSON.stringify(["backend", "validação"]),
      dueDate: past(2),
      order: 1024,
    },
    {
      title: "Hook useTaskFilters — filtro por status e prioridade",
      description: "Estado local com URL sync usando searchParams.",
      status: "REVIEW",
      priority: "HIGH",
      tags: JSON.stringify(["frontend", "hooks"]),
      dueDate: past(1),
      order: 2048,
    },
    {
      title: "Configurar CORS na API NestJS",
      description: "Permitir origin do frontend em dev e prod separadamente.",
      status: "REVIEW",
      priority: "MEDIUM",
      tags: JSON.stringify(["backend", "segurança"]),
      dueDate: past(3),
      order: 3072,
    },
    // DONE (3)
    {
      title: "Scaffold monorepo pnpm workspace",
      description: "Estrutura apps/api e apps/web com package.json raiz.",
      status: "DONE",
      priority: "HIGH",
      tags: JSON.stringify(["devex", "setup"]),
      dueDate: past(5),
      order: 1024,
    },
    {
      title: "Schema Prisma com User e Task",
      description: "Modelos com índices, relações e tipos corretos para o kanban.",
      status: "DONE",
      priority: "URGENT",
      tags: JSON.stringify(["backend", "prisma"]),
      dueDate: past(4),
      order: 2048,
    },
    {
      title: "Autenticação JWT — login e registro",
      description: "Endpoints POST /auth/register e /auth/login com bcrypt + JWT.",
      status: "DONE",
      priority: "URGENT",
      tags: JSON.stringify(["auth", "backend"]),
      dueDate: past(3),
      order: 3072,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: { ...task, userId: rod.id } });
  }

  console.log("Seed concluído: 2 usuários e 15 tarefas criados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
