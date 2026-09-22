import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '../store/authStore';
import LoadingState from '../components/shared/LoadingState';
import UnauthorizedPage from '../pages/UnauthorizedPage';

const hasAccess = (permissions, { requiredPermission, anyOf, allOf }) => {
  if (requiredPermission) return permissions.includes(requiredPermission);
  if (anyOf) return anyOf.some((p) => permissions.includes(p));
  if (allOf) return allOf.every((p) => permissions.includes(p));
  return true;
};

export const ProtectedRoute = ({
  children,
  allowMustChange = false,
  requiredPermission,
  anyOf,
  allOf,
}) => {
  const status = useAuthStore((s) => s.status);
  const permissions = useAuthStore((s) => s.permissions);
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
  if (!hasAccess(permissions, { requiredPermission, anyOf, allOf })) {
    return <UnauthorizedPage />;
  }
  return children;
};

export const PermissionGuard = ({ permission, anyOf, allOf, children }) => {
  const permissions = useAuthStore((s) => s.permissions);
  if (!hasAccess(permissions, { requiredPermission: permission, anyOf, allOf })) {
    return <UnauthorizedPage />;
  }
  return children;
};

export const PublicOnlyRoute = ({ children }) => {
  const status = useAuthStore((s) => s.status);
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />;
  if (status === 'must-change-password') return <Navigate to="/change-password" replace />;
  return children;
};
