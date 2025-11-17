import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" />;

  if (role && user.role.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to="/" />;
  }

  return children;
}
