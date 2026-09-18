import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '../store/authStore';
import LoadingState from '../components/shared/LoadingState';

export const ProtectedRoute = ({ children, allowMustChange = false }) => {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === 'idle' || status === 'initializing') {
    return <LoadingState fullScreen label="Preparing dashboard…" />;
  }
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (status === 'must-change-password' && !allowMustChange) {
    return <Navigate to="/change-password" replace />;
  }
  return children;
};

export const PublicOnlyRoute = ({ children }) => {
  const status = useAuthStore((s) => s.status);
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />;
  if (status === 'must-change-password') return <Navigate to="/change-password" replace />;
  return children;
};

export const PermissionRoute = ({ permission, anyOf, allOf, children }) => {
  const permissions = useAuthStore((s) => s.permissions);
  const ok =
    (permission && permissions.includes(permission)) ||
    (anyOf && anyOf.some((p) => permissions.includes(p))) ||
    (allOf && allOf.every((p) => permissions.includes(p)));

  if (!ok) return <Navigate to="/unauthorized" replace />;
  return children;
};
