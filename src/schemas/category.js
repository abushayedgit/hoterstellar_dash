import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  description: z.string().trim().optional().default(''),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0, 'Must be 0 or greater').default(0),
});
