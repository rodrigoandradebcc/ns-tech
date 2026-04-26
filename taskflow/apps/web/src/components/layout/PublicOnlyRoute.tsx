import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/auth.store';

export default function PublicOnlyRoute() {
  const token = useAuthStore((s) => s.token);
  if (token) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
