import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../modules/auth/contexts/AuthContext";
import type { UserRole } from "../modules/auth/types/auth.types";

interface ProtectedRouteProps {
  children: ReactNode;
  roles: UserRole[];
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5EE] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
