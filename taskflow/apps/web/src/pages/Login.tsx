import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { z } from 'zod';
import { Loader2, Kanban } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { useAuth } from '@/features/auth/use-auth';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  remember: z.boolean(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => { document.title = 'Entrar — TaskFlow Pro'; }, []);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: standardSchemaResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '', remember: false },
  });

  async function onSubmit(data: LoginForm) {
    setApiError(null);
    try {
      await login({ email: data.email, password: data.password });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setApiError('Email ou senha inválidos.');
      } else {
        toast.error('Erro ao entrar. Tente novamente mais tarde.');
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
            <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
            <CardDescription>Entre com sua conta para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              {apiError && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {apiError}
                </p>
              )}

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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  {...register('password')}
                />
              </FormField>

              <div className="flex items-center justify-between">
                <Controller
                  name="remember"
                  control={control}
                  render={({ field }) => (
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      Lembrar-me
                    </label>
                  )}
                />
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => toast.info('Funcionalidade em breve')}
                >
                  Esqueci a senha
                </button>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Entrar
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Não tem conta?{' '}
                <Link to="/register" className="text-primary hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
