import { z } from 'zod';

const optionalNonNegative = z
  .union([z.literal(''), z.coerce.number().min(0, 'Must be 0 or greater')])
  .optional()
  .transform((v) => (v === '' || v == null ? '' : v));

export const foodSchema = z.object({
  // Core
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Select a category'),

  // Pricing
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  discount: z.coerce.number().min(0, '0–100').max(100, '0–100').default(0),

  // Availability & prep
  isAvailable: z.boolean().default(true),
  isVegetarian: z.boolean().default(false),
  isSpicy: z.boolean().default(false),
  preparationTime: z.coerce.number().int().min(1, 'At least 1 minute').default(15),

  // Composition
  ingredients: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),

  // Nutritional info (all optional; blank string = not provided)
  calories: optionalNonNegative,
  protein: optionalNonNegative,
  carbs: optionalNonNegative,
  fat: optionalNonNegative,
});
