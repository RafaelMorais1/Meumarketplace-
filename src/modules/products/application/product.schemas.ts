import { z } from 'zod';

/**
 * Schemas Zod de Validação de Produtos (RF-05, RF-06, RN-05, RNF-06)
 */

export const createProductSchema = z.object({
  title: z
    .string({ required_error: 'Título é obrigatório' })
    .trim()
    .min(3, 'Título deve conter no mínimo 3 caracteres')
    .max(160, 'Título deve conter no máximo 160 caracteres'),
  description: z
    .string({ required_error: 'Descrição é obrigatória' })
    .trim()
    .min(5, 'Descrição deve conter no mínimo 5 caracteres'),
  priceInCents: z
    .coerce
    .number({ required_error: 'Preço é obrigatório' })
    .int('Preço deve ser um número inteiro em centavos')
    .min(50, 'Preço mínimo é de R$ 0,50 (50 centavos) - RN-05'),
  stock: z
    .coerce
    .number()
    .int('Estoque deve ser um número inteiro')
    .min(0, 'Estoque não pode ser negativo')
    .default(0),
  imageUrl: z
    .string()
    .url('URL da imagem inválida')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

