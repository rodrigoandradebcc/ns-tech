import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/auth.store';
import { useTheme } from '@/hooks/use-theme';
import { useUpdateProfile, type UpdateProfileData } from '@/features/profile/use-update-profile';

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const profileSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  avatarUrl: z
    .string()
    .optional()
    .refine((v) => !v || /^https?:\/\/.+/.test(v), { message: 'URL inválida' }),
  bio: z.string().max(200, 'Máximo 200 caracteres').optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// ---------------------------------------------------------------------------
// Preferences helpers (module scope — no re-creation on each render)
// ---------------------------------------------------------------------------

interface Prefs {
  emailNotifications?: boolean;
}

function loadPrefs(): Prefs {
  try {
    return JSON.parse(localStorage.getItem('taskflow:prefs') ?? '{}');
  } catch {
    return {};
  }
}

function savePrefs(p: Prefs) {
  localStorage.setItem('taskflow:prefs', JSON.stringify({ ...loadPrefs(), ...p }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Profile() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { mutateAsync, isPending } = useUpdateProfile();

  const [emailNotifs, setEmailNotifs] = useState(() => loadPrefs().emailNotifications ?? false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => { document.title = 'Perfil — TaskFlow Pro'; }, []);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema as any),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      avatarUrl: user?.avatarUrl ?? '',
      bio: user?.bio ?? '',
    },
  });

  const avatarUrlValue = watch('avatarUrl') ?? '';
  const nameValue = watch('name') ?? '';

  useEffect(() => {
    setImgError(false);
  }, [avatarUrlValue]);

  // Sync form if auth store user updates (e.g. after successful save)
  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name ?? '',
      email: user.email ?? '',
      avatarUrl: user.avatarUrl ?? '',
      bio: user.bio ?? '',
    });
  }, [user, reset]);

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((w) => w[0])
      .filter(Boolean)
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  const validAvatarUrl =
    avatarUrlValue && /^https?:\/\/.+/.test(avatarUrlValue) && !imgError;

  const onSubmit = handleSubmit(async (values) => {
    const payload: UpdateProfileData = {
      name: values.name,
      email: values.email,
      avatarUrl: values.avatarUrl || undefined,
      bio: values.bio || undefined,
    };
    try {
      await mutateAsync(payload);
      toast.success('Perfil atualizado!');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError('email', { message: 'Email já cadastrado' });
      } else {
        toast.error('Erro ao salvar perfil');
      }
    }
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold">Perfil</h1>
        <p className="text-sm text-muted-foreground">Gerencie suas informações</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_240px]">
        {/* ---------------------------------------------------------------- */}
        {/* Left: Tabs                                                        */}
        {/* ---------------------------------------------------------------- */}
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
          </TabsList>

          {/* Profile tab */}
          <TabsContent value="profile" className="mt-4">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" {...register('name')} />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="avatarUrl">URL do avatar</Label>
                <Input id="avatarUrl" placeholder="https://..." {...register('avatarUrl')} />
                {errors.avatarUrl && (
                  <p className="text-xs text-destructive">{errors.avatarUrl.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  placeholder="Conte um pouco sobre você..."
                  {...register('bio')}
                />
                {errors.bio && (
                  <p className="text-xs text-destructive">{errors.bio.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Salvar alterações
              </Button>
            </form>
          </TabsContent>

          {/* Preferences tab */}
          <TabsContent value="preferences" className="mt-4 space-y-6">
            {/* Theme */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Tema</p>
              <RadioGroup
                value={theme}
                onValueChange={(v) => {
                  if (!v) return;
                  setTheme(v as typeof theme);
                  toast.success('Preferências atualizadas');
                }}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light">Claro</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark">Escuro</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="system" id="theme-system" />
                  <Label htmlFor="theme-system">Sistema</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Idioma</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="pt-BR" id="lang-pt" />
                  <Label htmlFor="lang-pt">Português (BR)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger>
                      <RadioGroupItem value="en-US" id="lang-en" disabled />
                    </TooltipTrigger>
                    <TooltipContent>Em breve</TooltipContent>
                  </Tooltip>
                  <Label htmlFor="lang-en" className="text-muted-foreground">
                    English (US)
                  </Label>
                </div>
              </div>
            </div>

            {/* Email notifications */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Notificações por email</p>
                <p className="text-xs text-muted-foreground">
                  Receba atualizações sobre suas tarefas
                </p>
              </div>
              <Switch
                checked={emailNotifs}
                onCheckedChange={(checked) => {
                  setEmailNotifs(checked);
                  savePrefs({ emailNotifications: checked });
                  toast.success('Preferências atualizadas');
                }}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* ---------------------------------------------------------------- */}
        {/* Right: Preview card                                               */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-lg font-semibold overflow-hidden">
            {validAvatarUrl ? (
              <img
                src={avatarUrlValue}
                alt="avatar"
                className="h-full w-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span>{getInitials(nameValue) || getInitials(user?.name ?? '')}</span>
            )}
          </div>
          <div className="text-center">
            <p className="font-medium">{nameValue || user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          {user?.createdAt && (
            <p className="text-xs text-muted-foreground">
              Membro desde{' '}
              {new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(
                new Date(user.createdAt),
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
