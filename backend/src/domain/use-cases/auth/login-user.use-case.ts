import {
  InvalidCredentialsError,
  PasswordAuthDisabledError,
} from '../../../shared/errors/auth-errors.js';
import { fail, ok, type Result } from '../../../shared/types/result.js';
import type { User } from '../../entities/user.entity.js';
import type { UserRepository } from '../../repositories/user.repository.js';
import type { RefreshTokenRepository } from '../../repositories/refresh-token.repository.js';
import type { PasswordHasher } from '../../services/password-hasher.js';
import type { IssuedTokens, TokenService } from '../../services/token-service.js';

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  user: User;
  tokens: IssuedTokens;
}

export interface LoginUserDeps {
  userRepository: UserRepository;
  refreshTokenRepository: RefreshTokenRepository;
  passwordHasher: PasswordHasher;
  tokenService: TokenService;
}

export class LoginUserUseCase {
  constructor(private readonly deps: LoginUserDeps) {}

  async execute(input: LoginUserInput): Promise<Result<LoginUserOutput>> {
    const email = input.email.trim().toLowerCase();

    const user = await this.deps.userRepository.findByEmail(email);
    if (!user) {
      return fail(new InvalidCredentialsError());
    }

    if (!user.passwordHash) {
      return fail(new PasswordAuthDisabledError());
    }

    const passwordOk = await this.deps.passwordHasher.verify(
      input.password,
      user.passwordHash,
    );
    if (!passwordOk) {
      return fail(new InvalidCredentialsError());
    }

    const tokens = await this.deps.tokenService.issueTokens(user.id);

    await this.deps.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: tokens.refreshTokenHash,
      expiresAt: tokens.refreshTokenExpiresAt,
    });

    return ok({ user, tokens });
  }
}
