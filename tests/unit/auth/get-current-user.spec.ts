import { describe, it, expect, beforeEach } from 'vitest';
import { GetCurrentUserUseCase } from '@/modules/auth/application/get-current-user.use-case';
import { InMemoryUserRepository } from '@tests/fakes/in-memory-user-repository';
import { InMemorySessionRepository } from '@tests/fakes/in-memory-session-repository';
import { SessionTokenService } from '@/modules/auth/infrastructure/session-token.service';

describe('RF-04: Obtenção do Perfil Autenticado (GetCurrentUserUseCase)', () => {
  let userRepo: InMemoryUserRepository;
  let sessionRepo: InMemorySessionRepository;
  let useCase: GetCurrentUserUseCase;

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    sessionRepo = new InMemorySessionRepository(userRepo);
    useCase = new GetCurrentUserUseCase(sessionRepo);
  });

  it('deve retornar o perfil do usuário ativo sem expor passwordHash (RNF-03)', async () => {
    // Por que esse teste importa? Garante que rotas que buscam o usuário logado nunca vazam o hash
    const user = await userRepo.create({
      name: 'Cliente VIP',
      email: 'vip@example.com',
      passwordHash: 'hash-super-secreto',
      role: 'buyer',
    });

    const token = 'token-valido-123';
    const tokenHash = SessionTokenService.hashToken(token);

    await sessionRepo.create({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });

    const result = await useCase.execute(token);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(user.id);
    expect(result?.name).toBe('Cliente VIP');
    expect(result?.email).toBe('vip@example.com');
    expect(result?.role).toBe('buyer');
    expect((result as any)?.passwordHash).toBeUndefined();
  });

  it('deve retornar null se o token não existir ou for inválido', async () => {
    const result = await useCase.execute('token-fantasma');
    expect(result).toBeNull();
  });

  it('deve retornar null se o token estiver expirado', async () => {
    const user = await userRepo.create({
      name: 'Expirado',
      email: 'expirado@example.com',
      passwordHash: 'hash',
      role: 'buyer',
    });

    const token = 'token-expirado';
    const tokenHash = SessionTokenService.hashToken(token);

    await sessionRepo.create({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() - 5000), // Expirado há 5 segundos
    });

    const result = await useCase.execute(token);
    expect(result).toBeNull();
  });

  it('deve retornar null se nenhum token for fornecido (visitante anônimo)', async () => {
    const result = await useCase.execute(undefined);
    expect(result).toBeNull();
  });
});

