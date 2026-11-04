import crypto from 'crypto';

/**
 * Serviço Criptográfico de Tokens de Sessão (ADR-003, RNF-02)
 * Gera tokens aleatórios de alta entropia para cookies e calcula o hash SHA-256 para persistência no banco.
 */
export class SessionTokenService {
  /**
   * Gera um token de 32 bytes (256 bits de entropia) codificado em base64url.
   * Este valor é entregue EXCLUSIVAMENTE ao navegador via cookie HttpOnly.
   */
  static generateToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Calcula o hash SHA-256 determinístico de um token de sessão.
   * Apenas este hash é gravado na tabela `sessions` do PostgreSQL.
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

