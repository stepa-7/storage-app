import { z } from 'zod';

import { VALIDATION } from '@shared/constants';

export const createStorageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Название обязательно')
    .max(
      VALIDATION.STORAGE.NAME_MAX_LENGTH,
      `Название не должно превышать ${VALIDATION.STORAGE.NAME_MAX_LENGTH} символов`,
    ),
  maxCapacity: z
    .number()
    .min(
      VALIDATION.STORAGE.CAPACITY_MIN,
      `Вместимость должна быть не менее ${VALIDATION.STORAGE.CAPACITY_MIN}`,
    )
    .max(
      VALIDATION.STORAGE.CAPACITY_MAX,
      `Вместимость не должна превышать ${VALIDATION.STORAGE.CAPACITY_MAX}`,
    ),
  unit: z.string().min(1, 'Должна быть выбрана единица измерения'),
  parentId: z.string().optional(),
});

export type CreateStorageSchema = z.infer<typeof createStorageSchema>;
