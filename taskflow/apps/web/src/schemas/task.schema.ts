import { z } from 'zod';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export const taskSchema = z.object({
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

export type TaskFormValues = z.infer<typeof taskSchema>;
