import { useForm as useMantineForm, type UseFormInput } from '@mantine/form';
import type { z } from 'zod';

/**
 * Утилита для создания форм с Zod валидацией
 * @param schema - Zod схема для валидации
 * @param initialValues - Начальные значения формы
 * @param options - Дополнительные опции для Mantine form
 */
export function useZodForm<T extends Record<string, unknown>>(
  schema: z.ZodSchema<T>,
  initialValues: T,
  options?: Omit<UseFormInput<T>, 'initialValues' | 'validate'>,
) {
  return useMantineForm<T>({
    initialValues,
    validate: (values) => validateWithZod(schema, values), // <-- свой валидатор
    ...options,
  });
}

/**
 * Получает первую ошибку валидации из Zod результата
 */
export function getZodFormErrors<T>(result: z.ZodSafeParseResult<T>): Record<string, string> {
  if (result.success) {
    return {};
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue: z.ZodIssue) => {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  });

  return errors;
}

/**
 * Валидирует данные с помощью Zod схемы и возвращает ошибки в формате Mantine
 */
export function validateWithZod<T>(schema: z.ZodSchema<T>, data: T): Record<string, string> {
  const result = schema.safeParse(data);
  return getZodFormErrors(result);
}
