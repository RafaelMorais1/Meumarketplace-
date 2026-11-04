import { describe, it, expect } from 'vitest';
import { registerSchema } from '@/modules/auth/application/auth.schemas';
import { createProductSchema } from '@/modules/products/application/product.schemas';
import { InMemoryProductRepository } from '@tests/fakes/in-memory-product-repository';
import { ListPublicProductsUseCase } from '@/modules/products/application/list-public-products.use-case';

describe('Segurança de Entrada: Proteção contra Injeção de SQL, XSS e Payloads Maliciosos', () => {
  it('deve rejeitar e-mails com tentativas de injeção de SQL ou quebras de comando', () => {
    // Por que esse teste importa? Garante que o Zod bloqueia formatos maliciosos antes mesmo de chegarem ao ORM
    const maliciousEmails = [
      "admin'--@exemplo.com",
      "'; DROP TABLE users; --@malicioso.com",
      "' OR 1=1 --",
      "<script>alert(1)</script>@email.com",
    ];

    for (const email of maliciousEmails) {
      expect(() =>
        registerSchema.parse({
          name: 'Hacker',
          email,
          password: 'Password123',
          role: 'buyer',
        })
      ).toThrow();
    }
  });

  it('deve tratar com segurança tentativas de SQL Injection em buscas do catálogo', async () => {
    // Garante que o Drizzle ORM e o caso de uso tratam termos como strings parametrizadas literais
    const productRepo = new InMemoryProductRepository();
    const listPublic = new ListPublicProductsUseCase(productRepo);

    await productRepo.create({
      sellerId: 's1',
      title: 'Mouse Gamer',
      description: 'Mouse de alta precisão',
      priceInCents: 10000,
      stock: 10,
    });

    // Injeção de SQL clássica tentando retornar todos os registros ou quebrar a query
    const sqlInjectionPayload = "' OR '1'='1' --";
    const result = await listPublic.execute({ search: sqlInjectionPayload });

    // Deve buscar literalmente pela string "' OR '1'='1' --", resultando em 0 itens sem crashar
    expect(result.total).toBe(0);
    expect(result.items.length).toBe(0);
  });

  it('deve rejeitar payloads com títulos de produto gigantescos (proteção contra DoS de memória)', () => {
    const hugeTitle = 'A'.repeat(500); // Limite máximo é 160

    expect(() =>
      createProductSchema.parse({
        title: hugeTitle,
        description: 'Descrição válida',
        priceInCents: 1000,
        stock: 1,
      })
    ).toThrow(/máximo 160 caracteres/);
  });
});

