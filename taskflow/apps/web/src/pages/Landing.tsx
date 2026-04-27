import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Zap,
  Users,
  Target,
  Check,
  ArrowRight,
  Kanban,
  Menu,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const FEATURES = [
  {
    icon: Zap,
    title: "Kanban em 30 segundos",
    description:
      "Crie seu board, adicione as colunas que fazem sentido pro seu time e comece a mover tarefas. Sem curva de aprendizado.",
  },
  {
    icon: Users,
    title: "Colaboração simples",
    description:
      "Convide o time com um link, veja quem está trabalhando em quê e evite retrabalho — sem reuniões de status.",
  },
  {
    icon: Target,
    title: "Foco no que importa",
    description:
      "Filtros por prioridade, tags e responsável. Veja apenas o que precisa de atenção, não um mar de tarefas.",
  },
];

const TESTIMONIALS = [
  {
    initials: "AC",
    name: "Ana Costa",
    role: "Tech Lead · Startup fictícia",
    quote:
      '"Migramos do Jira em uma semana. O time parou de reclamar de ferramenta e voltou a focar em código."',
  },
  {
    initials: "MR",
    name: "Marcos Rocha",
    role: "Product Manager · Empresa imaginária",
    quote:
      '"Finalmente consigo ver o progresso das sprints sem precisar de três dashboards diferentes."',
  },
  {
    initials: "JF",
    name: "Julia Fernandes",
    role: "Desenvolvedora · Projeto hipotético",
    quote:
      '"O drag-and-drop funciona de verdade. Parece bobo, mas faz toda a diferença no dia a dia."',
  },
];

const PRICING = [
  {
    name: "Free",
    price: "R$ 0",
    period: "para sempre",
    highlight: false,
    features: [
      "1 board",
      "Até 3 membros",
      "100 tarefas/mês",
      "Suporte por email",
    ],
  },
  {
    name: "Pro",
    price: "R$ 29",
    period: "por usuário/mês",
    highlight: true,
    badge: "Mais popular",
    features: [
      "Boards ilimitados",
      "Membros ilimitados",
      "Tarefas ilimitadas",
      "Filtros avançados",
      "Exportação CSV",
      "Suporte prioritário",
    ],
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    highlight: false,
    features: [
      "Tudo do Pro",
      "SSO / SAML",
      "Auditoria de atividades",
      "SLA garantido",
      "Onboarding dedicado",
    ],
  },
];

const FAQ = [
  {
    q: "Preciso de cartão de crédito para começar?",
    a: "Não. O plano Free é gratuito para sempre, sem cartão de crédito. Você só precisa de um email.",
  },
  {
    q: "Posso migrar do Trello ou Jira?",
    a: "Sim. Oferecemos importação via CSV de qualquer ferramenta que suporte exportação. O processo leva menos de 5 minutos.",
  },
  {
    q: "Os dados ficam no Brasil?",
    a: "Sim. Nossos servidores ficam em São Paulo (AWS sa-east-1) e os dados nunca saem do território nacional.",
  },
  {
    q: "Tem API pública?",
    a: "Nos planos Pro e Enterprise disponibilizamos acesso à API REST com autenticação por token. A documentação fica disponível no painel.",
  },
  {
    q: "Como funciona o suporte?",
    a: "Free: suporte por email com resposta em até 48h. Pro: chat com resposta em até 4h. Enterprise: canal dedicado com SLA.",
  },
];

function KanbanMockup() {
  return (
    <svg
      viewBox="0 0 480 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-lg opacity-90 drop-shadow-xl"
      aria-hidden="true"
    >
      {/* Board background */}
      <rect
        width="480"
        height="320"
        rx="12"
        fill="currentColor"
        className="text-muted/40"
      />
      {/* Column 1 – A fazer */}
      <rect
        x="16"
        y="16"
        width="136"
        height="24"
        rx="6"
        fill="currentColor"
        className="text-muted"
      />
      <rect
        x="24"
        y="22"
        width="60"
        height="12"
        rx="3"
        fill="currentColor"
        className="text-muted-foreground/50"
      />
      <rect
        x="16"
        y="48"
        width="136"
        height="72"
        rx="8"
        fill="white"
        className="dark:fill-card"
      />
      <rect
        x="28"
        y="60"
        width="80"
        height="8"
        rx="3"
        fill="currentColor"
        className="text-foreground/70"
      />
      <rect
        x="28"
        y="74"
        width="108"
        height="6"
        rx="3"
        fill="currentColor"
        className="text-muted-foreground/40"
      />
      <rect x="28" y="86" width="40" height="16" rx="4" fill="#ede9fe" />
      <rect
        x="16"
        y="128"
        width="136"
        height="72"
        rx="8"
        fill="white"
        className="dark:fill-card"
      />
      <rect
        x="28"
        y="140"
        width="96"
        height="8"
        rx="3"
        fill="currentColor"
        className="text-foreground/70"
      />
      <rect
        x="28"
        y="154"
        width="108"
        height="6"
        rx="3"
        fill="currentColor"
        className="text-muted-foreground/40"
      />
      <rect x="28" y="166" width="48" height="16" rx="4" fill="#ede9fe" />
      {/* Column 2 – Fazendo */}
      <rect
        x="168"
        y="16"
        width="136"
        height="24"
        rx="6"
        fill="currentColor"
        className="text-muted"
      />
      <rect
        x="176"
        y="22"
        width="60"
        height="12"
        rx="3"
        fill="currentColor"
        className="text-muted-foreground/50"
      />
      <rect
        x="168"
        y="48"
        width="136"
        height="72"
        rx="8"
        fill="white"
        className="dark:fill-card"
      />
      <rect
        x="180"
        y="60"
        width="88"
        height="8"
        rx="3"
        fill="currentColor"
        className="text-foreground/70"
      />
      <rect
        x="180"
        y="74"
        width="110"
        height="6"
        rx="3"
        fill="currentColor"
        className="text-muted-foreground/40"
      />
      <rect
        x="180"
        y="86"
        width="56"
        height="16"
        rx="4"
        fill="#7c3aed"
        opacity="0.15"
      />
      {/* Column 3 – Feito */}
      <rect
        x="320"
        y="16"
        width="144"
        height="24"
        rx="6"
        fill="currentColor"
        className="text-muted"
      />
      <rect
        x="328"
        y="22"
        width="48"
        height="12"
        rx="3"
        fill="currentColor"
        className="text-muted-foreground/50"
      />
      <rect
        x="320"
        y="48"
        width="144"
        height="72"
        rx="8"
        fill="white"
        className="dark:fill-card"
      />
      <rect
        x="332"
        y="60"
        width="76"
        height="8"
        rx="3"
        fill="currentColor"
        className="text-foreground/70"
      />
      <rect
        x="332"
        y="74"
        width="116"
        height="6"
        rx="3"
        fill="currentColor"
        className="text-muted-foreground/40"
      />
      <rect x="332" y="86" width="44" height="16" rx="4" fill="#d1fae5" />
      <rect
        x="320"
        y="128"
        width="144"
        height="72"
        rx="8"
        fill="white"
        className="dark:fill-card"
      />
      <rect
        x="332"
        y="140"
        width="92"
        height="8"
        rx="3"
        fill="currentColor"
        className="text-foreground/70"
      />
      <rect
        x="332"
        y="154"
        width="116"
        height="6"
        rx="3"
        fill="currentColor"
        className="text-muted-foreground/40"
      />
      <rect x="332" y="166" width="52" height="16" rx="4" fill="#d1fae5" />
    </svg>
  );
}

// ─── AnimateIn ────────────────────────────────────────────────────────────────

function AnimateIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-out",
        inView
          ? "opacity-100 translate-y-0"
          : "motion-safe:opacity-0 motion-safe:translate-y-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          <Kanban className="size-5 text-primary" />
          <span>TaskFlow Pro</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a
            href="#features"
            className="transition-colors duration-300 ease-in-out hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="transition-colors duration-300 ease-in-out hover:text-foreground"
          >
            Preços
          </a>
          <a href="#faq" className="transition-colors duration-300 ease-in-out hover:text-foreground">
            FAQ
          </a>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
            Entrar
          </Button>
          <Button size="sm" onClick={() => navigate("/register")}>
            Começar grátis
          </Button>
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Abrir menu" />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-0">
              <SheetHeader className="border-b border-border px-6 py-4">
                <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Kanban className="size-4 text-primary" />
                  TaskFlow Pro
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4">
                <a
                  href="#features"
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  Preços
                </a>
                <a
                  href="#faq"
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  FAQ
                </a>
              </nav>
              <div className="flex flex-col gap-2 border-t border-border p-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigate("/login");
                    setOpen(false);
                  }}
                >
                  Entrar
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    navigate("/register");
                    setOpen(false);
                  }}
                >
                  Começar grátis
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const navigate = useNavigate();
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:flex-row lg:py-32">
      <div className="flex flex-1 flex-col gap-6 text-center lg:text-left">
        <Badge
          variant="secondary"
          className="mx-auto w-fit lg:mx-0 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500"
        >
          Novo · Drag &amp; drop com reordenação automática
        </Badge>
        <h1 className="font-['Inter'] text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 motion-safe:delay-150">
          Kanban simples para
          <br className="hidden sm:block" />
          <span className="text-primary"> times que entregam</span>
        </h1>
        <p className="max-w-lg text-lg leading-relaxed text-muted-foreground mx-auto lg:mx-0 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 motion-safe:delay-300">
          Pare de perder tempo configurando ferramentas. Com o TaskFlow Pro você
          organiza tarefas, acompanha o progresso e entrega mais — em menos de
          30 segundos.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 motion-safe:delay-500">
          <Button
            size="lg"
            className="gap-2"
            onClick={() => navigate("/register")}
          >
            Cadastrar grátis
            <ArrowRight className="size-4" />
          </Button>
          <a
            href="#features"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            Ver como funciona
          </a>
        </div>
        <p className="text-xs text-muted-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700 motion-safe:delay-700">
          Sem cartão de crédito · Plano Free para sempre
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-8 motion-safe:duration-700 motion-safe:delay-300">
        <KanbanMockup />
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="border-t border-border bg-muted/30 py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateIn className="mb-8 text-center lg:mb-16">
          <h2 className="font-['Inter'] text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Feito para quem não quer complicar
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tudo que um time pequeno precisa. Nada que não precise.
          </p>
        </AnimateIn>
        <div className="grid gap-8 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }, i) => (
            <AnimateIn key={title} delay={i * 150}>
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-[transform,box-shadow] duration-500 ease-in-out hover:-translate-y-1 hover:shadow-md">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateIn className="mb-8 text-center lg:mb-16">
          <h2 className="font-['Inter'] text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            O que dizem os usuários
          </h2>
          <p className="mt-3 text-sm text-muted-foreground italic">
            Depoimentos fictícios para fins de demonstração
          </p>
        </AnimateIn>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map(({ initials, name, role, quote }, i) => (
            <AnimateIn key={name} delay={i * 150}>
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-shadow duration-500 ease-in-out hover:shadow-md">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {quote}
                </p>
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {name}
                    </p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const navigate = useNavigate();
  return (
    <section id="pricing" className="border-t border-border bg-muted/30 py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateIn className="mb-8 text-center lg:mb-16">
          <h2 className="font-['Inter'] text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Planos simples, sem surpresas
          </h2>
          <p className="mt-4 text-muted-foreground">
            Comece grátis. Faça upgrade quando precisar.
          </p>
        </AnimateIn>
        <div className="grid gap-6 md:grid-cols-3">
          {PRICING.map(
            ({ name, price, period, highlight, badge, features }, i) => (
              <AnimateIn key={name} delay={i * 150}>
                <div
                  className={cn(
                    "relative flex flex-col gap-6 rounded-xl border p-6 transition-[transform,box-shadow] duration-500 ease-in-out hover:-translate-y-1",
                    highlight
                      ? "border-primary bg-primary/5 shadow-md hover:shadow-xl"
                      : "border-border bg-card hover:shadow-lg",
                  )}
                >
                  {badge && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                      {badge}
                    </Badge>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {name}
                    </p>
                    <p className="mt-1 text-3xl font-bold text-foreground">
                      {price}
                    </p>
                    {period && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {period}
                      </p>
                    )}
                  </div>
                  <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="size-4 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={highlight ? "default" : "outline"}
                    className="mt-auto w-full"
                    onClick={() => navigate("/register")}
                  >
                    {name === "Enterprise"
                      ? "Falar com vendas"
                      : "Começar agora"}
                  </Button>
                </div>
              </AnimateIn>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <AnimateIn className="mb-8 text-center lg:mb-12">
          <h2 className="font-['Inter'] text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Perguntas frequentes
          </h2>
        </AnimateIn>
        <AnimateIn delay={150}>
          <Accordion multiple className="divide-y divide-border">
            {FAQ.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="text-sm font-medium text-foreground py-4">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimateIn>
      </div>
    </section>
  );
}

function Footer() {
  const [email, setEmail] = useState("");

  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    toast.info("Inscrição mock — sem backend");
    setEmail("");
  }

  return (
    <footer className="border-t border-border bg-muted/30 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Kanban className="size-4 text-primary" />
              TaskFlow Pro
            </div>
            <p className="text-xs text-muted-foreground max-w-xs">
              Kanban simples para times que entregam. Feito com React + NestJS.
            </p>
          </div>

          <form onSubmit={handleNewsletter} className="flex flex-col gap-2">
            <p className="text-xs font-medium text-foreground">Newsletter</p>
            <div className="flex gap-2">
              <input
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50"
              />
              <Button type="submit" size="sm">
                Inscrever
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} TaskFlow Pro. Todos os direitos
            reservados.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">
              Termos de uso
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Landing() {
  useEffect(() => {
    document.title = "TaskFlow Pro — Kanban simples para times que entregam";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <Pricing />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
