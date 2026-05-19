import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Укажите email')
    .email('Некорректный email'),
  password: z
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .refine((v) => !/\s/.test(v), 'Пароль не должен содержать пробелы'),
});

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Укажите email')
    .email('Некорректный email'),
  password: z
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .refine((v) => !/\s/.test(v), 'Пароль не должен содержать пробелы'),
  fullName: z
    .string()
    .trim()
    .min(2, 'ФИО должно содержать минимум 2 символа')
    .max(150, 'ФИО не длиннее 150 символов')
    .regex(/^[\p{L}][\p{L}\s.\-']{1,}$/u, 'Только буквы, пробелы, дефис и апостроф'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
