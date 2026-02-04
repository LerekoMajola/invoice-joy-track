import { forwardRef, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export const AdminProtectedRoute = forwardRef<HTMLDivElement, AdminProtectedRouteProps>(
  function AdminProtectedRoute({ children }, ref) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // React Router may attach refs to route elements in some cases;
  // keep a ref-safe wrapper without affecting layout.
  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
});
