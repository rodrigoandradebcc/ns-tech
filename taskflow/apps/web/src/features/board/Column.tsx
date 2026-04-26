import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableCard from './SortableCard';
import TaskModal from '@/features/tasks/TaskModal';
import type { Task, TaskStatus } from '@/types';

interface ColumnProps {
  status: TaskStatus;
  label: string;
  tasks: Task[];
}

export default function Column({ status, label, tasks }: ColumnProps) {
  const sorted = [...tasks].sort((a, b) => a.order - b.order);
  const [modalOpen, setModalOpen] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status },
  });

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 lg:w-auto lg:flex-1">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <Badge variant="secondary" className="text-xs tabular-nums">
            {tasks.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setModalOpen(true)}
          aria-label={`Criar tarefa em ${label}`}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 rounded-xl p-2 min-h-24 transition-colors ${
          isOver ? 'border border-primary/50 bg-primary/5' : 'bg-muted/50'
        }`}
      >
        <SortableContext items={sorted.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {sorted.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma tarefa
                <br />
                <span className="text-xs">Clique em + para criar</span>
              </p>
          ) : (
            sorted.map((task) => <SortableCard key={task.id} task={task} />)
          )}
        </SortableContext>
      </div>
      <TaskModal open={modalOpen} onOpenChange={setModalOpen} defaultStatus={status} />
    </div>
  );
}
