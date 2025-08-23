import { z } from 'zod';

import { VALIDATION } from '@shared/constants';

export const signinSchema = z.object({
  login: z
    .string()
    .min(3, 'Логин должен содержать минимум 3 символа')
    .max(50, 'Логин не должен превышать 50 символов'),
  password: z
    .string()
    .min(
      VALIDATION.PASSWORD.MIN_LENGTH,
      `Пароль должен содержать минимум ${VALIDATION.PASSWORD.MIN_LENGTH} символов`,
    )
    .max(
      VALIDATION.PASSWORD.MAX_LENGTH,
      `Пароль не должен превышать ${VALIDATION.PASSWORD.MAX_LENGTH} символов`,
    ),
});

export type SigninSchema = z.infer<typeof signinSchema>;

export const signupSchema = z
  .object({
    login: z
      .string()
      .min(3, 'Логин должен содержать минимум 3 символа')
      .max(50, 'Логин не должен превышать 50 символов'),
    email: z
      .string()
      .min(
        VALIDATION.EMAIL.MIN_LENGTH,
        `Email должен содержать минимум ${VALIDATION.EMAIL.MIN_LENGTH} символа`,
      )
      .max(
        VALIDATION.EMAIL.MAX_LENGTH,
        `Email не должен превышать ${VALIDATION.EMAIL.MAX_LENGTH} символов`,
      )
      .regex(VALIDATION.EMAIL.PATTERN, 'Неверный формат эл. почты'),
    password: z
      .string()
      .min(
        VALIDATION.PASSWORD.MIN_LENGTH,
        `Пароль должен содержать минимум ${VALIDATION.PASSWORD.MIN_LENGTH} символов`,
      )
      .max(
        VALIDATION.PASSWORD.MAX_LENGTH,
        `Пароль не должен превышать ${VALIDATION.PASSWORD.MAX_LENGTH} символов`,
      ),
    confirmPassword: z.string(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Пароли не совпадают',
      });
    }
  });

export type SignupSchema = z.infer<typeof signupSchema>;
