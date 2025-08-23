import { z } from 'zod';

export const templateAttributeSchema = z.object({
  name: z.string().min(1, 'Название атрибута обязательно'),
  type: z.enum(['TEXT', 'NUMBER', 'DATE', 'FILE', 'BOOLEAN']),
  required: z.boolean().optional(),
  maxLength: z.number().int().positive().optional(),
  maxFileSize: z.number().int().positive().optional(),
  allowedFileTypes: z.array(z.string()).optional(),
});

export type TemplateAttributeSchema = z.infer<typeof templateAttributeSchema>;

export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  schema: z.record(z.string(), templateAttributeSchema), // Переименовано в schema
});

export type CreateTemplateSchema = z.infer<typeof createTemplateSchema>;

export const updateTemplateSchema = createTemplateSchema.partial().extend({
  is_deleted: z.boolean().optional(),
});

export type UpdateTemplateSchema = z.infer<typeof updateTemplateSchema>;
