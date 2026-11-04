import { describe, it, expect, beforeEach } from 'vitest';
import { RegisterUserUseCase } from '@/modules/auth/application/register-user.use-case';
import { InMemoryUserRepository } from '@tests/fakes/in-memory-user-repository';
import { FakePasswordHasher } from '@tests/fakes/fake-password-hasher';
import { ConflictError } from '@/shared/errors/app-error';

describe('RF-01: Cadastro de Usuário (RegisterUserUseCase)', () => {
  let userRepo: InMemoryUserRepository;
  let hasher: FakePasswordHasher;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    hasher = new FakePasswordHasher();
    useCase = new RegisterUserUseCase(userRepo, hasher);
  });

  it('deve cadastrar um comprador (buyer) com sucesso e sanitizar o retorno (RNF-03)', async () => {
    // Por que esse teste importa? Garante que o fluxo feliz salva o usuário e NUNCA expõe a senha
    const result = await useCase.execute({
      name: 'João Silva',
      email: 'joao@example.com',
      password: 'Password123',
      role: 'buyer',
    });

    expect(result.id).toBeDefined();
    expect(result.name).toBe('João Silva');
    expect(result.email).toBe('joao@example.com');
    expect(result.role).toBe('buyer');
    // RNF-03: Garante estritamente que a propriedade passwordHash não existe no retorno
    expect((result as any).passwordHash).toBeUndefined();

    // Valida que o hash foi salvo no repositório
    const savedInDb = await userRepo.findByEmail('joao@example.com');
    expect(savedInDb?.passwordHash).toBe('hashed_Password123');
  });

  it('deve cadastrar um vendedor (seller) com sucesso', async () => {
    // Garante que o papel 'seller' é aceito corretamente
    const result = await useCase.execute({
      name: 'Maria Vendedora',
      email: 'maria@loja.com',
      password: 'Password123',
      role: 'seller',
    });

    expect(result.role).toBe('seller');
  });

  it('deve rejeitar cadastro com e-mail duplicado (ConflictError)', async () => {
    // Previne que dois usuários compartilhem a mesma credencial de login
    await useCase.execute({
      name: 'Primeiro Usuário',
      email: 'duplicado@example.com',
      password: 'Password123',
      role: 'buyer',
    });

    await expect(
      useCase.execute({
        name: 'Segundo Usuário',
        email: 'DUPLICADO@EXAMPLE.COM', // Testa insensibilidade a maiúsculas
        password: 'Password456',
        role: 'seller',
      })
    ).rejects.toThrow(ConflictError);
  });

  it('deve rejeitar senha com menos de 8 caracteres (RN-04)', async () => {
    // Protege contra senhas frágeis e suscetíveis a ataques rápidos de força bruta
    await expect(
      useCase.execute({
        name: 'Carlos',
        email: 'carlos@example.com',
        password: 'Pass1', // Apenas 5 caracteres
        role: 'buyer',
      })
    ).rejects.toThrow(/mínimo 8 caracteres/);
  });

  it('deve rejeitar senha que contenha apenas números ou apenas letras (RN-04)', async () => {
    // Garante complexidade mínima exigindo letras e números combinados
    await expect(
      useCase.execute({
        name: 'Carlos',
        email: 'carlos@example.com',
        password: 'somenteletras',
        role: 'buyer',
      })
    ).rejects.toThrow(/pelo menos um número/);

    await expect(
      useCase.execute({
        name: 'Carlos',
        email: 'carlos@example.com',
        password: '1234567890',
        role: 'buyer',
      })
    ).rejects.toThrow(/pelo menos uma letra/);
  });

  it('deve rejeitar papel inválido diferente de buyer e seller (RN-01)', async () => {
    // Previne que invasores injetem papéis arbitrários como 'admin' ou 'superadmin' via payload
    await expect(
      useCase.execute({
        name: 'Hacker',
        email: 'hacker@example.com',
        password: 'Password123',
        role: 'admin' as any,
      })
    ).rejects.toThrow();
  });
});

