'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DrizzleUserRepository } from '@/modules/users/infrastructure/drizzle-user.repository';
import { DrizzleSessionRepository } from '../infrastructure/drizzle-session.repository';
import { Argon2PasswordHasher } from '../infrastructure/argon2-hasher';
import { RegisterUserUseCase } from '../application/register-user.use-case';
import { LoginUserUseCase } from '../application/login-user.use-case';
import { LogoutUserUseCase } from '../application/logout-user.use-case';
import { GetCurrentUserUseCase } from '../application/get-current-user.use-case';
import { sessionCookieOptions } from '../infrastructure/cookie.service';
import { AppError } from '@/shared/errors/app-error';
import { PublicUser } from '@/modules/users/domain/user.entity';

// Fábrica de dependências (Composition Root dos casos de uso de Auth)
function getAuthUseCases() {
  const userRepo = new DrizzleUserRepository();
  const sessionRepo = new DrizzleSessionRepository();
  const hasher = new Argon2PasswordHasher();

  return {
    register: new RegisterUserUseCase(userRepo, hasher),
    login: new LoginUserUseCase(userRepo, sessionRepo, hasher),
    logout: new LogoutUserUseCase(sessionRepo),
    getCurrentUser: new GetCurrentUserUseCase(sessionRepo),
  };
}

export type ActionState = {
  error?: string;
  success?: boolean;
};

/**
 * Server Action: Cadastro de Usuário (RF-01)
 */
export async function registerAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    role: formData.get('role') as string,
  };

  const { register, login } = getAuthUseCases();

  try {
    // 1. Cadastra o novo usuário
    await register.execute({
      name: rawData.name,
      email: rawData.email,
      password: rawData.password,
      role: rawData.role as any,
    });

    // 2. Efetua login automático após o cadastro
    const { sessionToken } = await login.execute({
      email: rawData.email,
      password: rawData.password,
    });

    // 3. Grava o cookie HttpOnly seguro no navegador
    cookies().set(sessionCookieOptions.name, sessionToken, sessionCookieOptions);
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return { error: (error as any).errors[0]?.message || 'Dados inválidos fornecidos.' };
    }
    return { error: 'Ocorreu um erro ao processar o cadastro. Tente novamente.' };
  }

  // Redireciona para a home autenticado
  redirect('/');
}

/**
 * Server Action: Login (RF-02)
 */
export async function loginAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { login } = getAuthUseCases();

  try {
    const { sessionToken } = await login.execute(rawData);
    cookies().set(sessionCookieOptions.name, sessionToken, sessionCookieOptions);
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return { error: (error as any).errors[0]?.message || 'Credenciais inválidas.' };
    }
    return { error: 'Falha no login. Verifique seus dados.' };
  }

  redirect('/');
}

/**
 * Server Action: Logout (RF-03)
 */
export async function logoutAction(): Promise<void> {
  const { logout } = getAuthUseCases();
  const token = cookies().get(sessionCookieOptions.name)?.value;

  if (token) {
    await logout.execute(token);
    cookies().delete(sessionCookieOptions.name);
  }

  redirect('/login');
}

/**
 * Helper de Servidor: Obter usuário logado atual (RF-04, RNF-03)
 */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const { getCurrentUser } = getAuthUseCases();
  const token = cookies().get(sessionCookieOptions.name)?.value;
  return getCurrentUser.execute(token);
}

