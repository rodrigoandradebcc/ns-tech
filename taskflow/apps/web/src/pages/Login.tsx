import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/form-field';
import { useAuth } from '@/features/auth/use-auth';
import { AuthPageShell } from '@/components/layout/auth-page-shell';
import { loginSchema, type LoginForm } from '@/schemas/auth.schema';

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
    <AuthPageShell title="Bem-vindo de volta" description="Entre com sua conta para continuar">
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
          <PasswordInput
            id="password"
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
    </AuthPageShell>
  );
}
