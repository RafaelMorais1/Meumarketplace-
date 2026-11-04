import { describe, it, expect, beforeEach } from 'vitest';
import { LoginUserUseCase } from '@/modules/auth/application/login-user.use-case';
import { InMemoryUserRepository } from '@tests/fakes/in-memory-user-repository';
import { InMemorySessionRepository } from '@tests/fakes/in-memory-session-repository';
import { FakePasswordHasher } from '@tests/fakes/fake-password-hasher';
import { UnauthorizedError } from '@/shared/errors/app-error';

describe('RF-02: Autenticação / Login (LoginUserUseCase)', () => {
  let userRepo: InMemoryUserRepository;
  let sessionRepo: InMemorySessionRepository;
  let hasher: FakePasswordHasher;
  let useCase: LoginUserUseCase;

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    sessionRepo = new InMemorySessionRepository(userRepo);
    hasher = new FakePasswordHasher();
    useCase = new LoginUserUseCase(userRepo, sessionRepo, hasher);

    // Cria um usuário base para testes
    await userRepo.create({
      name: 'Vendedor Cadastrado',
      email: 'seller@example.com',
      passwordHash: await hasher.hash('Correta123'),
      role: 'seller',
    });
  });

  it('deve autenticar com credenciais corretas, gerar token e registrar sessão (RF-02, ADR-003)', async () => {
    // Por que esse teste importa? Garante que o login emite um token seguro e persiste seu hash
    const result = await useCase.execute({
      email: 'seller@example.com',
      password: 'Correta123',
    });

    expect(result.sessionToken).toBeDefined();
    expect(result.sessionToken.length).toBeGreaterThan(20);
    expect(result.user.email).toBe('seller@example.com');
    expect(result.user.role).toBe('seller');
    expect((result.user as any).passwordHash).toBeUndefined();

    // Valida que a sessão foi registrada no repositório com data futura (7 dias - RN-06)
    expect(sessionRepo.sessions.length).toBe(1);
    const session = sessionRepo.sessions[0];
    expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now() + 1000 * 60 * 60 * 24 * 6);
  });

  it('deve rejeitar e-mail inexistente com mensagem genérica (evitar enumeração de contas)', async () => {
    // Previne que invasores descubram quais e-mails estão cadastrados no sistema testando logins
    await expect(
      useCase.execute({
        email: 'inexistente@example.com',
        password: 'Correta123',
      })
    ).rejects.toThrow(UnauthorizedError);
  });

  it('deve rejeitar senha incorreta com mensagem genérica (RF-02)', async () => {
    // Garante que senhas erradas nunca autenticam o usuário
    await expect(
      useCase.execute({
        email: 'seller@example.com',
        password: 'SenhaErrada123',
      })
    ).rejects.toThrow(UnauthorizedError);

    // Nenhuma sessão deve ser criada
    expect(sessionRepo.sessions.length).toBe(0);
  });
});

