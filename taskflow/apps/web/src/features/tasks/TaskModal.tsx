import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { X, CalendarIcon, Archive, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FormField } from '@/components/ui/form-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useCreateTask, useUpdateTask, useArchiveTask } from '@/features/tasks/use-tasks';
import type { Task, TaskStatus } from '@/types';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

const taskSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres'),
  description: z.string().optional(),
  status: z.enum(['BACKLOG', 'IN_PROGRESS', 'REVIEW', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  tags: z.array(z.string()),
  dueDate: z
    .date()
    .min(startOfToday(), { message: 'Data não pode ser passada' })
    .optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

function buildDefaults(task?: Task, defaultStatus?: TaskStatus): TaskFormValues {
  if (task) {
    return {
      title: task.title,
      description: task.description ?? '',
      status: task.status as unknown as TaskFormValues['status'],
      priority: task.priority,
      tags: task.tags,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    };
  }
  return {
    title: '',
    description: '',
    status: (defaultStatus ?? 'BACKLOG') as TaskFormValues['status'],
    priority: 'MEDIUM',
    tags: [],
    dueDate: undefined,
  };
}

const STATUS_LABELS: Record<string, string> = {
  BACKLOG: 'Backlog',
  IN_PROGRESS: 'Em Progresso',
  REVIEW: 'Review',
  DONE: 'Concluído',
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-muted-foreground',
  MEDIUM: 'text-blue-600 dark:text-blue-400',
  HIGH: 'text-orange-600 dark:text-orange-400',
  URGENT: 'text-red-600 dark:text-red-400',
};

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  defaultStatus?: TaskStatus;
}

export default function TaskModal({ open, onOpenChange, task, defaultStatus }: TaskModalProps) {
  const isEditing = !!task;
  const create = useCreateTask();
  const update = useUpdateTask();
  const archive = useArchiveTask();
  const isPending = create.isPending || update.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: buildDefaults(task, defaultStatus),
  });

  const [tagInput, setTagInput] = useState('');
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) setTagInput('');
  }

  useEffect(() => {
    if (open) {
      reset(buildDefaults(task, defaultStatus));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      title: values.title,
      status: values.status,
      priority: values.priority,
      tags: values.tags,
      dueDate: values.dueDate?.toISOString(),
      description: values.description || undefined,
    };
    try {
      if (isEditing) {
        await update.mutateAsync({ id: task!.id, data: payload });
        toast.success('Tarefa atualizada!');
      } else {
        await create.mutateAsync(payload);
        toast.success('Tarefa criada!');
      }
      onOpenChange(false);
    } catch {
      // toast shown by mutation's onError
    }
  });

  async function handleArchive() {
    try {
      await archive.mutateAsync(task!.id);
      toast.success('Tarefa arquivada!');
      onOpenChange(false);
    } catch {
      // toast shown by mutation's onError
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => onOpenChange(v)}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar tarefa' : 'Nova tarefa'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormField label="Título" htmlFor="title" error={errors.title?.message}>
            <Input
              id="title"
              autoFocus
              placeholder="Título da tarefa"
              {...register('title')}
            />
          </FormField>

          <FormField label="Descrição" htmlFor="description" error={errors.description?.message}>
            <Textarea
              id="description"
              placeholder="Descreva a tarefa (opcional)"
              {...register('description')}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <FormField label="Status" error={errors.status?.message}>
                  <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {(['BACKLOG', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const).map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />

            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <FormField label="Prioridade" error={errors.priority?.message}>
                  <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((p) => (
                        <SelectItem key={p} value={p}>
                          <span className={PRIORITY_COLORS[p]}>{PRIORITY_LABELS[p]}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />
          </div>

          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <FormField label="Tags" error={errors.tags?.message}>
                {field.value.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {field.value.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                        {tag}
                        <button
                          type="button"
                          className="rounded-sm outline-none focus-visible:ring-1"
                          onClick={() =>
                            field.onChange(field.value.filter((t) => t !== tag))
                          }
                        >
                          <X className="size-3" />
                          <span className="sr-only">Remover {tag}</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const v = tagInput.trim();
                      if (v && !field.value.includes(v)) {
                        field.onChange([...field.value, v]);
                      }
                      setTagInput('');
                    }
                  }}
                  placeholder="Digite e pressione Enter"
                />
              </FormField>
            )}
          />

          <Controller
            control={control}
            name="dueDate"
            render={({ field }) => (
              <FormField label="Data de entrega" error={errors.dueDate?.message}>
                <Popover>
                  <PopoverTrigger
                    type="button"
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'w-full justify-start text-left font-normal',
                      !field.value && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="size-4" />
                    {field.value
                      ? new Intl.DateTimeFormat('pt-BR').format(field.value)
                      : 'Selecionar data'}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(d) => field.onChange(d ?? undefined)}
                      disabled={(d) => d < startOfToday()}
                    />
                  </PopoverContent>
                </Popover>
              </FormField>
            )}
          />

          <DialogFooter>
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={handleArchive}
                disabled={isPending || archive.isPending}
                className="gap-2"
              >
                {archive.isPending && <Loader2 className="size-4 animate-spin" />}
                <Archive className="size-4" />
                Arquivar
              </Button>
            )}
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
