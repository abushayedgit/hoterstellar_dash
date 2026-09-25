import { z } from 'zod';

export const foodSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  category: z.string().min(1, 'Select a category'),
  isAvailable: z.boolean().default(true),
  isVegetarian: z.boolean().default(false),
  isSpicy: z.boolean().default(false),
  preparationTime: z.coerce.number().int().min(1, 'At least 1 minute').default(15),
  discount: z.coerce.number().min(0, '0–100').max(100, '0–100').default(0),
});
