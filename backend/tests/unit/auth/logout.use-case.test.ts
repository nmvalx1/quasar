import { makeLogoutUserTestContext } from './auth-test-fixtures.js';

describe('LogoutUseCase', () => {
  it('удаляет предъявленный refresh токен из хранилища', async () => {
    const { useCase, refreshTokenRepository, tokenService } = makeLogoutUserTestContext();

    const issued = await tokenService.issueTokens('user-1');
    await refreshTokenRepository.create({
      userId: 'user-1',
      tokenHash: issued.refreshTokenHash,
      expiresAt: issued.refreshTokenExpiresAt,
    });

    const result = await useCase.execute({ refreshToken: issued.refreshToken });

    expect(result.success).toBe(true);
    expect(refreshTokenRepository.list()).toHaveLength(0);
  });

  it('идемпотентность: повторный logout с тем же токеном — успех, без ошибок', async () => {
    const { useCase } = makeLogoutUserTestContext();

    const first = await useCase.execute({ refreshToken: 'never-existed' });
    const second = await useCase.execute({ refreshToken: 'never-existed' });

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
  });
});
