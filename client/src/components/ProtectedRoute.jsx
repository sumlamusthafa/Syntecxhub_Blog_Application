import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth-context.js";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="screen-center" role="status">
        Loading your session…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
