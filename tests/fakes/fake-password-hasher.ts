import { IPasswordHasher } from '@/modules/auth/domain/password-hasher.interface';

/**
 * Fake Hasher para testes unitários em memória.
 * Permite rodar testes de casos de uso sem o custo de ~100ms do Argon2id.
 */
export class FakePasswordHasher implements IPasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    return `hashed_${plainPassword}`;
  }

  async compare(plainPassword: string, hash: string): Promise<boolean> {
    return hash === `hashed_${plainPassword}`;
  }
}

