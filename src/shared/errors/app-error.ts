/**
 * Hierarquia de Erros Padronizados da Aplicação
 * Permite que a camada de apresentação traduza erros de domínio para códigos HTTP equivalentes
 * sem expor detalhes internos de infraestrutura ou banco de dados.
 */
export abstract class AppError extends Error {
  public abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  public readonly statusCode = 400;
}

export class UnauthorizedError extends AppError {
  public readonly statusCode = 401;
}

export class ForbiddenError extends AppError {
  public readonly statusCode = 403;
}

export class NotFoundError extends AppError {
  public readonly statusCode = 404;
}

export class ConflictError extends AppError {
  public readonly statusCode = 409;
}
