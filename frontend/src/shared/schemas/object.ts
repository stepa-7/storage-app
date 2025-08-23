import { z } from 'zod';

import { VALIDATION } from '@shared/constants';

export const baseObjectSchema = z.object({
  template_id: z.string().min(1, 'Выберите шаблон'),
  name: z
    .string()
    .min(1, 'Название обязательно')
    .max(
      VALIDATION.OBJECT.NAME_MAX_LENGTH,
      `Название не должно превышать ${VALIDATION.OBJECT.NAME_MAX_LENGTH} символов`,
    ),
  size: z.coerce.number().positive('Размер должен быть больше 0'),
  unit_id: z.string().min(1, 'Выберите единицу измерения'),
  photo: z
    .instanceof(File)
    .refine((file) => file.size <= VALIDATION.FILE.MAX_SIZE, 'Файл слишком большой')
    .refine(
      (file) =>
        VALIDATION.FILE.ALLOWED_TYPES.includes(
          file.type as 'image/png' | 'image/jpeg' | 'application/pdf' | 'text/plain',
        ),
      'Недопустимый тип файла',
    )
    .optional()
    .nullable(),
});

// Динамические атрибуты шаблона: строим схему на лету
export function buildAttributesSchemaFromTemplate(
  schema: Record<
    string,
    { type: 'TEXT' | 'NUMBER' | 'DATE' | 'FILE' | 'BOOLEAN'; required?: boolean }
  >,
) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [key, meta] of Object.entries(schema)) {
    switch (meta.type) {
      case 'TEXT':
        shape[key] = meta.required ? z.string().min(1, 'Обязательное поле') : z.string().optional();
        break;
      case 'NUMBER':
        shape[key] = meta.required ? z.coerce.number() : z.coerce.number().optional();
        break;
      case 'DATE':
        shape[key] = meta.required ? z.string().min(1, 'Обязательное поле') : z.string().optional();
        break;
      case 'BOOLEAN':
        shape[key] = meta.required ? z.boolean() : z.boolean().optional();
        break;
      case 'FILE':
        shape[key] = meta.required ? z.instanceof(File) : z.instanceof(File).optional();
        break;
    }
  }
  return z.object(shape);
}
