import { describe, it, expect } from 'vitest';
import { env } from '@/config/env';

describe('Setup Smoke Test', () => {
  it('deve carregar e validar as variáveis de ambiente essenciais com Zod', () => {
    // Valida que o módulo de configuração fail-fast está lendo os valores do .env
    expect(env.NODE_ENV).toBeDefined();
    expect(env.DATABASE_URL).toMatch(/^postgres(ql)?:\/\//);
    expect(env.SESSION_SECRET.length).toBeGreaterThanOrEqual(32);
  });

  it('deve executar asserções matemáticas básicas no Vitest', () => {
    expect(1 + 1).toBe(2);
  });
});

