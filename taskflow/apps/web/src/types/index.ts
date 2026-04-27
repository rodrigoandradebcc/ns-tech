export type { TaskStatus, TaskPriority } from '@/enums/task.enums';
import type { TaskStatus, TaskPriority } from '@/enums/task.enums';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  dueDate?: string;
  order: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}
