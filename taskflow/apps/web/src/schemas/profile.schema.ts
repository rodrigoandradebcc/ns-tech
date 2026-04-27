import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  avatarUrl: z
    .string()
    .optional()
    .refine((v) => !v || /^https?:\/\/.+/.test(v), { message: 'URL inválida' }),
  bio: z.string().max(200, 'Máximo 200 caracteres').optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
