import { hash, verify, Algorithm } from '@node-rs/argon2';
import { IPasswordHasher } from '../domain/password-hasher.interface';

/**
 * Implementação Real com Argon2id
 * RNF-01: Criptografia resistente a ataques massivos de GPU e ASIC.
 * ADR-004: Escolha de Argon2id pela OWASP.
 */
export class Argon2PasswordHasher implements IPasswordHasher {
  // Configurações recomendadas pela OWASP para ambientes de aplicação
  private readonly options = {
    algorithm: Algorithm.Argon2id,
    memoryCost: 19456, // 19 MB de RAM por hash
    timeCost: 2,       // 2 iterações
    parallelism: 1,    // 1 thread
  };

  async hash(plainPassword: string): Promise<string> {
    return hash(plainPassword, this.options);
  }

  async compare(plainPassword: string, passwordHash: string): Promise<boolean> {
    try {
      return await verify(passwordHash, plainPassword);
    } catch {
      // Se o hash estiver corrompido ou mal formatado, falha de forma segura sem crashar o processo
      return false;
    }
  }
}
