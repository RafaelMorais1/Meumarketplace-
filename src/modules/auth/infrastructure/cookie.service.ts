import { env } from '@/config/env';

export const SESSION_COOKIE_NAME = 'marketplace_session';

/**
 * Utilitário de Configuração de Cookies Seguros (ADR-003, RNF-02)
 */
export const sessionCookieOptions = {
  name: SESSION_COOKIE_NAME,
  httpOnly: true, // Impede acesso via JavaScript (mitiga XSS)
  sameSite: 'lax' as const, // Mitiga requisições forjadas externas (CSRF)
  secure: env.NODE_ENV === 'production', // Apenas HTTPS em ambiente de produção
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 dias em segundos (RN-06)
};

