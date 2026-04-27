import { useNavigate } from 'react-router-dom';
import { useAuthStore } from './auth.store';
import { authApi } from './auth.api';
import { queryClient } from '@/lib/queryClient';

export function useAuth() {
  const { user, token, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const isAuthenticated = !!token;

  async function login(data: { email: string; password: string }) {
    const { user, token } = await authApi.login(data);
    setAuth(user, token);
    navigate('/dashboard');
  }

  async function register(data: { name: string; email: string; password: string }) {
    const { user, token } = await authApi.register(data);
    setAuth(user, token);
    navigate('/dashboard');
  }

  function logout() {
    clearAuth();
    queryClient.clear();
    navigate('/');
  }

  return { user, token, isAuthenticated, login, register, logout };
}
