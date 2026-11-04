/**
 * Interface do Hasher de Senhas (Porta de Saída de Criptografia)
 * ADR-004: Isola a escolha da biblioteca de hash da regra de negócio.
 */
export interface IPasswordHasher {
  hash(plainPassword: string): Promise<string>;
  compare(plainPassword: string, hash: string): Promise<boolean>;
}

