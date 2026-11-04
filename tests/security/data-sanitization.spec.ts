import { describe, it, expect } from 'vitest';
import { RegisterUserUseCase } from '@/modules/auth/application/register-user.use-case';
import { LoginUserUseCase } from '@/modules/auth/application/login-user.use-case';
import { GetCurrentUserUseCase } from '@/modules/auth/application/get-current-user.use-case';
import { InMemoryUserRepository } from '@tests/fakes/in-memory-user-repository';
import { InMemorySessionRepository } from '@tests/fakes/in-memory-session-repository';
import { FakePasswordHasher } from '@tests/fakes/fake-password-hasher';

describe('RNF-03: Sanitização de Dados e Prevenção de Vazamento de Credenciais', () => {
  const userRepo = new InMemoryUserRepository();
  const sessionRepo = new InMemorySessionRepository(userRepo);
  const hasher = new FakePasswordHasher();

  it('RegisterUserUseCase: NUNCA deve incluir passwordHash, password ou segredos no objeto retornado', async () => {
    // Por que esse teste importa? Garante que respostas de cadastro enviadas ao browser não contêm o hash
    const register = new RegisterUserUseCase(userRepo, hasher);

    const publicUser = await register.execute({
      name: 'Cliente Auditado',
      email: 'audit@seguranca.com',
      password: 'SenhaForte123',
      role: 'buyer',
    });

    const serialized = JSON.stringify(publicUser);

    expect(serialized).not.toContain('SenhaForte123');
    expect(serialized).not.toContain('passwordHash');
    expect((publicUser as any).passwordHash).toBeUndefined();
    expect((publicUser as any).password).toBeUndefined();
  });

  it('LoginUserUseCase: NUNCA deve expor o hash de senha do usuário no resultado do login', async () => {
    const login = new LoginUserUseCase(userRepo, sessionRepo, hasher);

    const result = await login.execute({
      email: 'audit@seguranca.com',
      password: 'SenhaForte123',
    });

    const serializedUser = JSON.stringify(result.user);
    expect(serializedUser).not.toContain('passwordHash');
    expect((result.user as any).passwordHash).toBeUndefined();
  });

  it('GetCurrentUserUseCase: NUNCA deve expor o hash de senha ao resolver a sessão do usuário', async () => {
    const login = new LoginUserUseCase(userRepo, sessionRepo, hasher);
    const getCurrentUser = new GetCurrentUserUseCase(sessionRepo);

    const { sessionToken } = await login.execute({
      email: 'audit@seguranca.com',
      password: 'SenhaForte123',
    });

    const user = await getCurrentUser.execute(sessionToken);
    expect(user).not.toBeNull();
    expect((user as any).passwordHash).toBeUndefined();
    expect(JSON.stringify(user)).not.toContain('passwordHash');
  });
});

