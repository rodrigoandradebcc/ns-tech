import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/features/auth/auth.store';
import type { User } from '@/types';

export interface UpdateProfileData {
  name?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: UpdateProfileData) =>
      api.patch<User>('/users/me', data).then((r) => r.data),
    onSuccess: (user) => {
      const { token, setAuth } = useAuthStore.getState();
      setAuth(user, token!);
    },
  });
}
