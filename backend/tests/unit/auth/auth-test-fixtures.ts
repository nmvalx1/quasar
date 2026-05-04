import { LoginUserUseCase } from '../../../src/domain/use-cases/auth/login-user.use-case.js';
import { LogoutUseCase } from '../../../src/domain/use-cases/auth/logout.use-case.js';
import { RefreshTokenUseCase } from '../../../src/domain/use-cases/auth/refresh-token.use-case.js';
import { RegisterUserUseCase } from '../../../src/domain/use-cases/auth/register-user.use-case.js';
import type { User } from '../../../src/domain/entities/user.entity.js';
import type { IssuedTokens } from '../../../src/domain/services/token-service.js';

import { makeUser } from './user-test.factory.js';
import {
  FakePasswordHasher,
  FakeTokenService,
  InMemoryRefreshTokenRepository,
  InMemoryUserRepository,
} from './test-doubles.js';

export { makeUser } from './user-test.factory.js';

export interface RegisterUserTestContext {
  useCase: RegisterUserUseCase;
  userRepository: InMemoryUserRepository;
  refreshTokenRepository: InMemoryRefreshTokenRepository;
}

export function makeRegisterUserTestContext(): RegisterUserTestContext {
  const userRepository = new InMemoryUserRepository();
  const refreshTokenRepository = new InMemoryRefreshTokenRepository();
  const passwordHasher = new FakePasswordHasher();
  const tokenService = new FakeTokenService();
  const useCase = new RegisterUserUseCase({
    userRepository,
    refreshTokenRepository,
    passwordHasher,
    tokenService,
  });
  return { useCase, userRepository, refreshTokenRepository };
}

export interface LoginUserTestContext {
  useCase: LoginUserUseCase;
  userRepository: InMemoryUserRepository;
  refreshTokenRepository: InMemoryRefreshTokenRepository;
}

export function makeLoginUserTestContext(): LoginUserTestContext {
  const userRepository = new InMemoryUserRepository();
  const refreshTokenRepository = new InMemoryRefreshTokenRepository();
  const passwordHasher = new FakePasswordHasher();
  const tokenService = new FakeTokenService();
  const useCase = new LoginUserUseCase({
    userRepository,
    refreshTokenRepository,
    passwordHasher,
    tokenService,
  });
  return { useCase, userRepository, refreshTokenRepository };
}

export interface LogoutUserTestContext {
  useCase: LogoutUseCase;
  refreshTokenRepository: InMemoryRefreshTokenRepository;
  tokenService: FakeTokenService;
}

export function makeLogoutUserTestContext(): LogoutUserTestContext {
  const refreshTokenRepository = new InMemoryRefreshTokenRepository();
  const tokenService = new FakeTokenService();
  const useCase = new LogoutUseCase({ refreshTokenRepository, tokenService });
  return { useCase, refreshTokenRepository, tokenService };
}

export interface RefreshTokenTestContext {
  useCase: RefreshTokenUseCase;
  userRepository: InMemoryUserRepository;
  refreshTokenRepository: InMemoryRefreshTokenRepository;
  tokenService: FakeTokenService;
  initial: IssuedTokens;
  now: Date;
  user: User;
}

export async function makeRefreshTokenTestContext(
  now: Date = new Date('2026-05-03T20:00:00Z'),
): Promise<RefreshTokenTestContext> {
  const userRepository = new InMemoryUserRepository();
  const refreshTokenRepository = new InMemoryRefreshTokenRepository();
  const tokenService = new FakeTokenService({ now: () => now });

  const user = makeUser({ id: 'user-1', email: 'rt@quasar.test' });
  userRepository.seed(user);

  const initial = await tokenService.issueTokens(user.id);
  await refreshTokenRepository.create({
    userId: user.id,
    tokenHash: initial.refreshTokenHash,
    expiresAt: initial.refreshTokenExpiresAt,
  });

  const useCase = new RefreshTokenUseCase({
    userRepository,
    refreshTokenRepository,
    tokenService,
  });

  return {
    useCase,
    userRepository,
    refreshTokenRepository,
    tokenService,
    initial,
    now,
    user,
  };
}
