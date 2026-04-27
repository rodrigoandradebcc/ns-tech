import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import Board from '@/features/board/Board';
import TaskModal from '@/features/tasks/TaskModal';
import { useTasks } from '@/features/tasks/use-tasks';
import type { TaskPriority } from '@/types';

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' },
] as const;

function BoardSkeleton() {
  return (
    <div className="flex gap-4 lg:grid lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex w-72 shrink-0 flex-col gap-3 lg:w-auto lg:flex-1">
          <div className="flex items-center gap-2 px-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
          <div className="flex flex-col gap-2 rounded-xl bg-muted/50 p-2">
            {Array.from({ length: 2 }).map((_, j) => (
              <Skeleton key={j} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading, isError, refetch } = useTasks();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [firstModalOpen, setFirstModalOpen] = useState(false);

  useEffect(() => {
    document.title = 'Board — TaskFlow Pro';
  }, []);

  const tasks = data ?? [];

  const activeTasks = tasks.filter((t) => t.status !== 'ARCHIVED');

  const allTags = useMemo(
    () => [...new Set(tasks.flatMap((t) => t.tags))].sort(),
    [tasks],
  );

  const filteredTasks = useMemo(() => {
    let result = activeTasks;
    const q = searchQuery.trim().toLowerCase();
    if (q) result = result.filter((t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
    if (selectedPriorities.length > 0)
      result = result.filter((t) => selectedPriorities.includes(t.priority));
    if (selectedTags.length > 0)
      result = result.filter((t) => selectedTags.some((tag) => t.tags.includes(tag)));
    return result;
  }, [activeTasks, searchQuery, selectedPriorities, selectedTags]);

  const hasActiveFilters = searchQuery.trim().length > 0 || selectedPriorities.length > 0 || selectedTags.length > 0;

  function togglePriority(value: string) {
    setSelectedPriorities((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value],
    );
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function clearFilters() {
    setSearchQuery('');
    setSelectedPriorities([]);
    setSelectedTags([]);
  }

  if (isLoading) {
    return (
      <div className="overflow-x-auto pb-4">
        <BoardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <AlertCircle className="size-10 text-destructive" />
        <div>
          <p className="font-medium text-foreground">Não foi possível carregar as tarefas</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Verifique sua conexão e tente novamente.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <svg
            viewBox="0 0 64 64"
            className="size-16 text-muted-foreground/40"
            fill="none"
            aria-hidden="true"
          >
            <rect x="2" y="10" width="18" height="44" rx="3" stroke="currentColor" strokeWidth="2" />
            <rect x="6" y="14" width="10" height="8" rx="1.5" fill="currentColor" opacity="0.5" />
            <rect x="6" y="25" width="10" height="8" rx="1.5" fill="currentColor" opacity="0.5" />
            <rect x="23" y="10" width="18" height="44" rx="3" stroke="currentColor" strokeWidth="2" />
            <rect x="27" y="14" width="10" height="8" rx="1.5" fill="currentColor" opacity="0.5" />
            <rect x="44" y="10" width="18" height="44" rx="3" stroke="currentColor" strokeWidth="2" />
          </svg>
          <p className="text-lg font-semibold text-foreground">Nenhuma tarefa ainda</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Crie sua primeira tarefa para começar a organizar seu trabalho.
          </p>
          <Button onClick={() => setFirstModalOpen(true)}>Criar primeira tarefa</Button>
        </div>
        <TaskModal open={firstModalOpen} onOpenChange={setFirstModalOpen} />
      </>
    );
  }

  return (
    <div>
      {/* Search + Filter bar */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tarefas..."
            className="pl-8"
            aria-label="Buscar tarefas"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
        {PRIORITIES.map(({ value, label }) => (
          <Badge
            key={value}
            variant={selectedPriorities.includes(value) ? 'default' : 'outline'}
            className="cursor-pointer select-none"
            onClick={() => togglePriority(value)}
          >
            {label}
          </Badge>
        ))}

        {allTags.length > 0 && (
          <>
            <span className="h-4 w-px bg-border" aria-hidden="true" />
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer select-none"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </>
        )}

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
            Limpar filtros
          </Button>
        )}
        </div>
      </div>

      {hasActiveFilters && (
        <p className="mb-3 text-xs text-muted-foreground">
          Mostrando {filteredTasks.length} de {activeTasks.length} tarefas
        </p>
      )}

      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma tarefa corresponde aos filtros selecionados.
          </p>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </div>
      ) : (
        <Board tasks={filteredTasks} />
      )}
    </div>
  );
}
