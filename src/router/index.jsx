import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import AppShell from '../components/layout/AppShell';
import LoadingState from '../components/shared/LoadingState';
import { PermissionGuard, ProtectedRoute, PublicOnlyRoute } from './guards';
import SectionPlaceholder from '../pages/SectionPlaceholder';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const ChangePasswordPage = lazy(() => import('../pages/ChangePasswordPage'));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const DashboardHomePage = lazy(() => import('../pages/DashboardHomePage'));
const AdminsPage = lazy(() => import('../pages/admins/AdminsPage'));
const SECTIONS = [
  // { path: 'admins', name: 'Admins', permission: 'admins.read' },
  { path: 'users', name: 'Users', permission: 'users.read' },
  { path: 'categories', name: 'Categories', permission: 'categories.read' },
  { path: 'foods', name: 'Foods', permission: 'foods.read' },
  { path: 'orders', name: 'Orders', permission: 'orders.read' },
  { path: 'bookings/table', name: 'Table Bookings', permission: 'bookings.read' },
  { path: 'bookings/event', name: 'Event Bookings', permission: 'bookings.read' },
  { path: 'reviews', name: 'Reviews', permission: 'reviews.read' },
  { path: 'notices', name: 'Notices', permission: 'notices.read' },
  { path: 'billboard', name: 'Billboard', permission: 'billboard.read' },
  { path: 'contacts', name: 'Contact Messages', permission: 'contact.read' },
  { path: 'visitors', name: 'Visitors', permission: 'visitor.read' },
  { path: 'analytics', name: 'Analytics', permission: 'analytics.read' },
];

export const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<LoadingState fullScreen />}>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPasswordPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicOnlyRoute>
              <ResetPasswordPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute allowMustChange>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHomePage />} />
          {SECTIONS.map((s) => (
            <Route
              key={s.path}
              path={s.path}
              element={
                <PermissionGuard permission={s.permission}>
                  <SectionPlaceholder name={s.name} />
                </PermissionGuard>
              }
            />
          ))}
          <Route
            path="admins"
            element={
              <PermissionGuard permission="admins.read">
                <AdminsPage />
              </PermissionGuard>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);
