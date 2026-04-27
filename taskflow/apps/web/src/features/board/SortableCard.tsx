import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from './Card';
import type { Task } from '@/types';

interface SortableCardProps {
  task: Task;
}

export default function SortableCard({ task }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { type: 'task', task } });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, touchAction: 'none' }}
      {...attributes}
      {...listeners}
    >
      <Card
        task={task}
        className={isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}
      />
    </div>
  );
}
