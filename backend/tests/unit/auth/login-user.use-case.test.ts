import { makeLoginUserTestContext, makeUser } from './auth-test-fixtures.js';

describe('LoginUserUseCase', () => {
  it('успешный логин: проверяет пароль, выдаёт токены, сохраняет refresh', async () => {
    const { useCase, userRepository, refreshTokenRepository } = makeLoginUserTestContext();
    userRepository.seed(
      makeUser({
        id: 'user-x',
        email: 'login@quasar.test',
        passwordHash: 'hashed:correct-pass',
      }),
    );

    const result = await useCase.execute({
      email: 'login@quasar.test',
      password: 'correct-pass',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.user.id).toBe('user-x');
    expect(refreshTokenRepository.list()).toHaveLength(1);
  });

  it('возвращает INVALID_CREDENTIALS если пользователя нет (email не существует)', async () => {
    const { useCase, refreshTokenRepository } = makeLoginUserTestContext();

    const result = await useCase.execute({
      email: 'ghost@quasar.test',
      password: 'whatever',
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('INVALID_CREDENTIALS');
    expect(result.error.statusCode).toBe(401);
    expect(refreshTokenRepository.list()).toHaveLength(0);
  });

  it('возвращает INVALID_CREDENTIALS при неверном пароле (не выдаёт токены)', async () => {
    const { useCase, userRepository, refreshTokenRepository } = makeLoginUserTestContext();
    userRepository.seed(
      makeUser({ email: 'login@quasar.test', passwordHash: 'hashed:correct-pass' }),
    );

    const result = await useCase.execute({
      email: 'login@quasar.test',
      password: 'wrong-pass',
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('INVALID_CREDENTIALS');
    expect(refreshTokenRepository.list()).toHaveLength(0);
  });

  it('возвращает PASSWORD_AUTH_DISABLED если у пользователя нет хеша пароля (соц-логин и т.п.)', async () => {
    const { useCase, userRepository } = makeLoginUserTestContext();
    userRepository.seed(makeUser({ email: 'social@quasar.test', passwordHash: null }));

    const result = await useCase.execute({
      email: 'social@quasar.test',
      password: 'anything',
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('PASSWORD_AUTH_DISABLED');
  });
});
