import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children, requiredRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Загрузка...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (requiredRoles && !requiredRoles.some((r) => user.roles.includes(r))) {
    return <Navigate to="/login" replace />;
  }

  return children;
}