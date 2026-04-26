import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { z } from 'zod';
import { Loader2, Kanban } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { useAuth } from '@/features/auth/use-auth';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { register: registerUser } = useAuth();

  useEffect(() => { document.title = 'Criar conta — TaskFlow Pro'; }, []);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: standardSchemaResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  async function onSubmit(data: RegisterForm) {
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError('email', { message: 'Este email já está em uso' });
      } else {
        toast.error('Erro ao criar conta. Tente novamente mais tarde.');
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center border-b border-border px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <Kanban className="size-5 text-primary" />
          TaskFlow Pro
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Crie sua conta</CardTitle>
            <CardDescription>Comece grátis, sem cartão de crédito</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <FormField label="Nome" htmlFor="name" error={errors.name?.message}>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Seu nome"
                  aria-invalid={!!errors.name}
                  {...register('name')}
                />
              </FormField>

              <FormField label="Email" htmlFor="email" error={errors.email?.message}>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@email.com"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
              </FormField>

              <FormField label="Senha" htmlFor="password" error={errors.password?.message}>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="No mínimo 8 caracteres"
                  aria-invalid={!!errors.password}
                  {...register('password')}
                />
              </FormField>

              <FormField
                label="Confirmar senha"
                htmlFor="confirmPassword"
                error={errors.confirmPassword?.message}
              >
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                  aria-invalid={!!errors.confirmPassword}
                  {...register('confirmPassword')}
                />
              </FormField>

              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Criar conta
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Já tem conta?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Entrar
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
