import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface PrivateRouteProps {
  allowedRoles?: string[];
}

export function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbf9f8]">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-[#003d4c]">autorenew</span>
          <p className="mt-2 text-sm text-[#656464]">Verifying secure session...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.includes(user.role);
    if (!hasRequiredRole) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#fbf9f8]">
          <div className="page-card p-8 text-center max-w-md">
            <span className="material-symbols-outlined text-5xl text-red-500">lock</span>
            <h1 className="mt-4 text-2xl font-bold text-[#003d4c]">Access Denied</h1>
            <p className="mt-2 text-[#656464]">Your account role is not authorized for this section.</p>
            <p className="mt-1 text-sm text-[#656464]">Required role(s): {allowedRoles.join(', ')}</p>
            <p className="mt-1 text-sm text-[#656464]">Your role: {user.role}</p>
          </div>
        </div>
      );
    }
  }

  return <Outlet context={{ user }} />;
}
