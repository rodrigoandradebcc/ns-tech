import { api } from '@/lib/api';
import type { Task, TaskStatus, TaskPriority } from '@/types';

export interface CreateTaskData {
  title: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  description?: string;
  tags?: string[];
  dueDate?: string;
  order?: number;
}

export type UpdateTaskData = Partial<CreateTaskData>;

export const tasksApi = {
  list: () => api.get<Task[]>('/tasks').then((r) => r.data),
  create: (data: CreateTaskData) => api.post<Task>('/tasks', data).then((r) => r.data),
  update: (id: string, data: UpdateTaskData) =>
    api.patch<Task>(`/tasks/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/tasks/${id}`),
  archive: (id: string) => api.post<Task>(`/tasks/${id}/archive`).then((r) => r.data),
};
