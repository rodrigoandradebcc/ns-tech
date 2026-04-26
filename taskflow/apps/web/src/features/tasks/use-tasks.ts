import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';
import { tasksApi, type CreateTaskData, type UpdateTaskData } from './tasks.api';
import type { Task } from '@/types';

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: tasksApi.list,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskData) => tasksApi.create(data),
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const prev = qc.getQueryData<Task[]>(['tasks']);
      const tempTask: Task = {
        id: `temp-${Date.now()}`,
        title: data.title,
        status: data.status ?? 'BACKLOG',
        priority: data.priority ?? 'MEDIUM',
        tags: data.tags ?? [],
        order: data.order ?? 1024,
        userId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: data.description,
        dueDate: data.dueDate,
      };
      qc.setQueryData<Task[]>(['tasks'], (old) => [...(old ?? []), tempTask]);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      qc.setQueryData(['tasks'], ctx?.prev);
      toast.error(getErrorMessage(_e, 'Não foi possível criar tarefa'));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) =>
      tasksApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const prev = qc.getQueryData<Task[]>(['tasks']);
      qc.setQueryData<Task[]>(['tasks'], (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...data } : t)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      qc.setQueryData(['tasks'], ctx?.prev);
      toast.error(getErrorMessage(_e, 'Não foi possível atualizar'));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const prev = qc.getQueryData<Task[]>(['tasks']);
      qc.setQueryData<Task[]>(['tasks'], (old) => old?.filter((t) => t.id !== id));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      qc.setQueryData(['tasks'], ctx?.prev);
      toast.error(getErrorMessage(_e, 'Não foi possível excluir'));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useArchiveTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.archive(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const prev = qc.getQueryData<Task[]>(['tasks']);
      qc.setQueryData<Task[]>(['tasks'], (old) =>
        old?.map((t) => (t.id === id ? { ...t, status: 'ARCHIVED' as const } : t)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      qc.setQueryData(['tasks'], ctx?.prev);
      toast.error(getErrorMessage(_e, 'Não foi possível arquivar'));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}
