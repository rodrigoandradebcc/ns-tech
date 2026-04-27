export type TaskStatus = 'BACKLOG' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'ARCHIVED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export const STATUS_LABELS: Record<string, string> = {
  BACKLOG: 'Backlog',
  IN_PROGRESS: 'Em Progresso',
  REVIEW: 'Review',
  DONE: 'Concluído',
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-muted-foreground',
  MEDIUM: 'text-blue-600 dark:text-blue-400',
  HIGH: 'text-orange-600 dark:text-orange-400',
  URGENT: 'text-red-600 dark:text-red-400',
};
