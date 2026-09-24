// src/schemas/admin.js
import { z } from 'zod';

export const ADMIN_ROLES = ['super_admin', 'admin', 'manager'];
export const CREATABLE_ADMIN_ROLES = ['admin', 'manager'];

export const createAdminSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  role: z.enum(CREATABLE_ADMIN_ROLES, {
    errorMap: () => ({ message: 'Select a role' }),
  }),
});

// The Edit form still permits all three — a Super Admin editing an existing
// Super Admin's role (their own, in the self-edit case) should not have the
// option disappear, and the backend rejects promotion attempts anyway.
export const updateAdminSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  role: z.enum(ADMIN_ROLES, { errorMap: () => ({ message: 'Select a role' }) }),
  isActive: z.boolean(),
});
