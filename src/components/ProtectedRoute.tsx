
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, profile, loading, isAdmin } = useAuth();

  console.log('ProtectedRoute state:', { user: !!user, profile: !!profile, loading, isAdmin });

  if (loading) {
    return (
      <div className="min-h-screen bg-marista-gray flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-marista-dark-blue mx-auto mb-4" />
          <p className="text-marista-dark-blue">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    console.log('User exists but no profile found');
    return (
      <div className="min-h-screen bg-marista-gray flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Erro ao carregar perfil do usuário</p>
          <p className="text-sm text-gray-600">Tente fazer logout e login novamente</p>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    console.log('Admin required but user is not admin');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
