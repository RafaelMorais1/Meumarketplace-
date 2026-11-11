'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DrizzleUserRepository } from '@/modules/users/infrastructure/drizzle-user.repository';
import { DrizzleSessionRepository } from '../infrastructure/drizzle-session.repository';
import { DrizzlePasswordResetTokenRepository } from '../infrastructure/drizzle-password-reset-token.repository';
import { ConsoleEmailService } from '../infrastructure/console-email.service';
import { Argon2PasswordHasher } from '../infrastructure/argon2-hasher';
import { RegisterUserUseCase } from '../application/register-user.use-case';
import { LoginUserUseCase } from '../application/login-user.use-case';
import { LogoutUserUseCase } from '../application/logout-user.use-case';
import { GetCurrentUserUseCase } from '../application/get-current-user.use-case';
import { RequestPasswordResetUseCase } from '../application/request-password-reset.use-case';
import { ResetPasswordUseCase } from '../application/reset-password.use-case';
import { sessionCookieOptions } from '../infrastructure/cookie.service';
import { AppError } from '@/shared/errors/app-error';
import { PublicUser } from '@/modules/users/domain/user.entity';

// Fábrica de dependências (Composition Root dos casos de uso de Auth)
function getAuthUseCases() {
  const userRepo = new DrizzleUserRepository();
  const sessionRepo = new DrizzleSessionRepository();
  const tokenRepo = new DrizzlePasswordResetTokenRepository();
  const emailService = new ConsoleEmailService();
  const hasher = new Argon2PasswordHasher();

  return {
    register: new RegisterUserUseCase(userRepo, hasher),
    login: new LoginUserUseCase(userRepo, sessionRepo, hasher),
    logout: new LogoutUserUseCase(sessionRepo),
    getCurrentUser: new GetCurrentUserUseCase(sessionRepo),
    requestPasswordReset: new RequestPasswordResetUseCase(userRepo, tokenRepo, emailService),
    resetPassword: new ResetPasswordUseCase(userRepo, tokenRepo, sessionRepo, hasher),
  };
}

export type ActionState = {
  error?: string;
  success?: boolean;
  message?: string;
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

/**
 * Server Action: Solicitação de Recuperação de Senha (RF-11, ADR-005)
 */
export async function forgotPasswordAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get('email') as string;
  const { requestPasswordReset } = getAuthUseCases();

  try {
    const result = await requestPasswordReset.execute({ email });
    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return { error: (error as any).errors[0]?.message || 'E-mail inválido.' };
    }
    return { error: 'Ocorreu um erro ao processar sua solicitação. Tente novamente.' };
  }
}

/**
 * Server Action: Redefinição de Senha com Token (RF-12, ADR-005)
 */
export async function resetPasswordAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    token: formData.get('token') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  const { resetPassword } = getAuthUseCases();

  try {
    const result = await resetPassword.execute(rawData);
    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return { error: (error as any).errors[0]?.message || 'Dados inválidos fornecidos.' };
    }
    return { error: 'Falha ao redefinir senha. Verifique o link e tente novamente.' };
  }
}

