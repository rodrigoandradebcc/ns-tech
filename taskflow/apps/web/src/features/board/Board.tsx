import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import Column from './Column';
import Card from './Card';
import { useUpdateTask } from '@/features/tasks/use-tasks';
import type { Task, TaskStatus } from '@/types';

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'BACKLOG', label: 'Backlog' },
  { status: 'IN_PROGRESS', label: 'Em Progresso' },
  { status: 'REVIEW', label: 'Revisão' },
  { status: 'DONE', label: 'Concluído' },
];

interface BoardProps {
  tasks: Task[];
}

export default function Board({ tasks }: BoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const update = useUpdateTask();

  const activeTasks = tasks.filter((t) => t.status !== 'ARCHIVED');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart({ active }: DragStartEvent) {
    const task = active.data.current?.task as Task | undefined;
    setActiveTask(task ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null);
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const dragged = active.data.current?.task as Task | undefined;
    if (!dragged) return;

    // Determine target column
    let targetStatus: TaskStatus;
    if (over.data.current?.type === 'column') {
      targetStatus = String(over.id) as TaskStatus;
    } else {
      const overTask = activeTasks.find((t) => t.id === String(over.id));
      if (!overTask) return;
      targetStatus = overTask.status;
    }

    // Sorted tasks in target column, excluding the dragged task
    const colTasks = activeTasks
      .filter((t) => t.status === targetStatus && t.id !== activeId)
      .sort((a, b) => a.order - b.order);

    let newOrder: number;

    if (over.data.current?.type === 'column') {
      // Dropped on the column body (empty column or no card target)
      newOrder =
        colTasks.length === 0 ? 1024 : colTasks[colTasks.length - 1].order + 1024;
    } else {
      // Dropped on a card
      const overIdx = colTasks.findIndex((t) => t.id === String(over.id));
      if (overIdx === -1) {
        newOrder = 1024;
      } else {
        // Determine insert-before vs insert-after based on relative source position
        const sourceColTasks = activeTasks
          .filter((t) => t.status === dragged.status)
          .sort((a, b) => a.order - b.order);
        const srcIdx = sourceColTasks.findIndex((t) => t.id === activeId);
        const sameCol = dragged.status === targetStatus;
        const insertAfter = sameCol && srcIdx < overIdx;

        if (insertAfter) {
          newOrder =
            overIdx === colTasks.length - 1
              ? colTasks[overIdx].order + 1024
              : (colTasks[overIdx].order + colTasks[overIdx + 1].order) / 2;
        } else {
          newOrder =
            overIdx === 0
              ? colTasks[0].order - 1024
              : (colTasks[overIdx - 1].order + colTasks[overIdx].order) / 2;
        }
      }
    }

    update.mutate({ id: activeId, data: { status: targetStatus, order: newOrder } });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 lg:grid lg:grid-cols-4">
          {COLUMNS.map(({ status, label }) => (
            <Column
              key={status}
              status={status}
              label={label}
              tasks={activeTasks.filter((t) => t.status === status)}
            />
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeTask && (
          <Card
            task={activeTask}
            className="shadow-xl rotate-2 opacity-95 cursor-grabbing"
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
