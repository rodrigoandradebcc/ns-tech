import { useState } from 'react';
import { MoreHorizontal, Calendar, Archive, Trash2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useArchiveTask } from '@/features/tasks/use-tasks';
import { useDeleteTask } from '@/features/tasks/use-tasks';
import TaskModal from '@/features/tasks/TaskModal';
import type { Task, TaskPriority } from '@/types';

const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  LOW: 'bg-muted text-muted-foreground border-transparent',
  MEDIUM: 'bg-blue-100 text-blue-700 border-transparent dark:bg-blue-900/30 dark:text-blue-400',
  HIGH: 'bg-orange-100 text-orange-700 border-transparent dark:bg-orange-900/30 dark:text-orange-400',
  URGENT: 'bg-red-100 text-red-700 border-transparent dark:bg-red-900/30 dark:text-red-400',
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

function formatDueDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(iso));
}

function dueDateClass(iso: string): string {
  const diff = (new Date(iso).getTime() - Date.now()) / 86400000;
  if (diff < 0) return 'text-destructive';
  if (diff < 2) return 'text-yellow-500 dark:text-yellow-400';
  return 'text-muted-foreground';
}

interface CardProps {
  task: Task;
  className?: string;
}

export default function Card({ task, className }: CardProps) {
  const archive = useArchiveTask();
  const remove = useDeleteTask();
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div
      className={cn("rounded-lg border border-border bg-card p-3 shadow-xs flex flex-col gap-2 cursor-pointer hover:border-primary/40 transition-colors", className)}
      onClick={() => setEditOpen(true)}
    >
      {/* Header row: title + 3-dots */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground leading-snug flex-1">{task.title}</p>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
              '-mr-1 shrink-0',
            )}
            aria-label={`Ações para ${task.title}`}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}>
              <Pencil className="size-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); archive.mutate(task.id); }}
            >
              <Archive className="size-4" />
              Arquivar
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => { e.stopPropagation(); remove.mutate(task.id); }}
            >
              <Trash2 className="size-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0 h-4">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Footer: priority + dueDate */}
      <div className="flex items-center justify-between gap-2 mt-0.5">
        <Badge className={cn('text-xs', PRIORITY_CLASSES[task.priority])}>
          {PRIORITY_LABELS[task.priority]}
        </Badge>
        {task.dueDate && (
          <span className={cn('flex items-center gap-1 text-xs', dueDateClass(task.dueDate))}>
            <Calendar className="size-3" />
            {formatDueDate(task.dueDate)}
          </span>
        )}
      </div>
      <TaskModal open={editOpen} onOpenChange={setEditOpen} task={task} />
    </div>
  );
}
