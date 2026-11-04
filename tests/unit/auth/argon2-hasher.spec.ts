import { describe, it, expect } from 'vitest';
import { Argon2PasswordHasher } from '@/modules/auth/infrastructure/argon2-hasher';

describe('RNF-01: Hashing de Senhas com Argon2id', () => {
  const hasher = new Argon2PasswordHasher();

  it('deve gerar um hash no padrão Argon2id ($argon2id$) e verificar com sucesso', async () => {
    // Por que esse teste importa? Garante que estamos usando o algoritmo correto da PHC/OWASP
    // e que a biblioteca gera hashes compatíveis e verificáveis.
    const password = 'MinhaSenhaSegura123';
    const hash = await hasher.hash(password);

    expect(hash).toContain('$argon2id$');
    const isValid = await hasher.compare(password, hash);
    expect(isValid).toBe(true);
  });

  it('deve rejeitar uma senha incorreta contra o hash', async () => {
    // Previne que credenciais incorretas sejam aceitas por falha lógica de comparação
    const hash = await hasher.hash('SenhaCorreta123');
    const isValid = await hasher.compare('SenhaIncorreta999', hash);

    expect(isValid).toBe(false);
  });

  it('deve retornar false de forma segura se o hash for inválido ou corrompido', async () => {
    // Previne que uma entrada corrompida de banco gere uma exceção não tratada no servidor
    const isValid = await hasher.compare('Senha', 'hash-invalido-quebrado');
    expect(isValid).toBe(false);
  });
});

