import { EmailAlreadyExistsError } from '../../../shared/errors/auth-errors.js';
import { fail, ok, type Result } from '../../../shared/types/result.js';
import type { User } from '../../entities/user.entity.js';
import type { UserRepository } from '../../repositories/user.repository.js';
import type { RefreshTokenRepository } from '../../repositories/refresh-token.repository.js';
import type { PasswordHasher } from '../../services/password-hasher.js';
import type { IssuedTokens, TokenService } from '../../services/token-service.js';

export interface RegisterUserInput {
  email: string;
  password: string;
  name?: string | null;
}

export interface RegisterUserOutput {
  user: User;
  tokens: IssuedTokens;
}

export interface RegisterUserDeps {
  userRepository: UserRepository;
  refreshTokenRepository: RefreshTokenRepository;
  passwordHasher: PasswordHasher;
  tokenService: TokenService;
}

export class RegisterUserUseCase {
  constructor(private readonly deps: RegisterUserDeps) {}

  async execute(input: RegisterUserInput): Promise<Result<RegisterUserOutput>> {
    const email = input.email.trim().toLowerCase();

    const existing = await this.deps.userRepository.findByEmail(email);
    if (existing) {
      return fail(new EmailAlreadyExistsError(email));
    }

    const passwordHash = await this.deps.passwordHasher.hash(input.password);

    const user = await this.deps.userRepository.create({
      email,
      passwordHash,
      name: input.name ?? null,
    });

    const tokens = await this.deps.tokenService.issueTokens(user.id);

    await this.deps.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: tokens.refreshTokenHash,
      expiresAt: tokens.refreshTokenExpiresAt,
    });

    return ok({ user, tokens });
  }
}
