import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../store/auth";

export function LoginGuard() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export function AdminGuard() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

