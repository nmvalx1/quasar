import { InvalidRefreshTokenError } from '../../../shared/errors/auth-errors.js';
import { fail, ok, type Result } from '../../../shared/types/result.js';
import type { RefreshTokenRepository } from '../../repositories/refresh-token.repository.js';
import type { UserRepository } from '../../repositories/user.repository.js';
import type { IssuedTokens, TokenService } from '../../services/token-service.js';

export interface RefreshTokenInput {
  refreshToken: string;
  /// Внешне передаваемое «сейчас» помогает детерминированно тестировать истечение срока.
  now?: Date;
}

export interface RefreshTokenOutput {
  tokens: IssuedTokens;
}

export interface RefreshTokenDeps {
  userRepository: UserRepository;
  refreshTokenRepository: RefreshTokenRepository;
  tokenService: TokenService;
}

export class RefreshTokenUseCase {
  constructor(private readonly deps: RefreshTokenDeps) {}

  async execute(input: RefreshTokenInput): Promise<Result<RefreshTokenOutput>> {
    const presentedHash = await this.deps.tokenService.hashRefreshToken(input.refreshToken);
    const stored = await this.deps.refreshTokenRepository.findByHash(presentedHash);

    if (!stored) {
      return fail(new InvalidRefreshTokenError());
    }

    const now = input.now ?? new Date();
    if (stored.expiresAt.getTime() <= now.getTime()) {
      // Истёкший токен сразу удаляем, чтобы не накапливался мусор.
      await this.deps.refreshTokenRepository.deleteByHash(presentedHash);
      return fail(new InvalidRefreshTokenError());
    }

    const user = await this.deps.userRepository.findById(stored.userId);
    if (!user) {
      await this.deps.refreshTokenRepository.deleteByHash(presentedHash);
      return fail(new InvalidRefreshTokenError());
    }

    // Rotation: предъявленный токен инвалидируем, выдаём свежую пару.
    await this.deps.refreshTokenRepository.deleteByHash(presentedHash);

    const tokens = await this.deps.tokenService.issueTokens(user.id);
    await this.deps.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: tokens.refreshTokenHash,
      expiresAt: tokens.refreshTokenExpiresAt,
    });

    return ok({ tokens });
  }
}
