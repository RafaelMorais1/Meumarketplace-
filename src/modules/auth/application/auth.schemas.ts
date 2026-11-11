import { z } from 'zod';

/**
 * Schemas Zod de Validação de Autenticação (RF-01, RF-02, RN-01, RN-04)
 */

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .trim()
    .min(2, 'Nome deve conter no mínimo 2 caracteres')
    .max(120, 'Nome deve conter no máximo 120 caracteres'),
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .trim()
    .toLowerCase()
    .email('Formato de e-mail inválido')
    .max(255, 'E-mail deve conter no máximo 255 caracteres')
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'E-mail contém caracteres inválidos'
    ),
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(8, 'Senha deve ter no mínimo 8 caracteres (RN-04)')
    .regex(/[A-Za-z]/, 'Senha deve conter pelo menos uma letra (RN-04)')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número (RN-04)'),
  role: z.enum(['buyer', 'seller'], {
    required_error: 'Selecione um papel: Comprador (buyer) ou Vendedor (seller)',
    invalid_type_error: "Papel deve ser 'buyer' ou 'seller'",
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .trim()
    .toLowerCase()
    .email('Formato de e-mail inválido'),
  password: z.string({ required_error: 'Senha é obrigatória' }).min(1, 'Senha é obrigatória'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .trim()
    .toLowerCase()
    .email('Formato de e-mail inválido'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string({ required_error: 'Token de recuperação é obrigatório' }).min(10, 'Token inválido'),
    password: z
      .string({ required_error: 'Nova senha é obrigatória' })
      .min(8, 'Senha deve ter no mínimo 8 caracteres (RN-04)')
      .regex(/[A-Za-z]/, 'Senha deve conter pelo menos uma letra (RN-04)')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um número (RN-04)'),
    confirmPassword: z.string({ required_error: 'Confirmação de senha é obrigatória' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
