import { AppError } from './app-error.js';

export class EmailAlreadyExistsError extends AppError {
  constructor(email: string) {
    super({
      code: 'EMAIL_ALREADY_EXISTS',
      message: `Пользователь с email ${email} уже зарегистрирован`,
      statusCode: 409,
    });
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super({
      code: 'INVALID_CREDENTIALS',
      message: 'Неверный email или пароль',
      statusCode: 401,
    });
  }
}

export class InvalidRefreshTokenError extends AppError {
  constructor() {
    super({
      code: 'INVALID_REFRESH_TOKEN',
      message: 'Refresh токен недействителен или истёк',
      statusCode: 401,
    });
  }
}

export class PasswordAuthDisabledError extends AppError {
  constructor() {
    super({
      code: 'PASSWORD_AUTH_DISABLED',
      message: 'Для этого аккаунта вход по паролю не настроен',
      statusCode: 401,
    });
  }
}
