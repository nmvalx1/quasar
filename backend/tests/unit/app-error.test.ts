import { AppError } from '../../src/shared/errors/app-error.js';

describe('AppError', () => {
  it('captures HTTP status code and stable error code for API responses', () => {
    const err = new AppError({
      code: 'LIMIT_EXCEEDED',
      message: 'Daily limit reached',
      statusCode: 429,
    });

    expect(err.code).toBe('LIMIT_EXCEEDED');
    expect(err.statusCode).toBe(429);
    expect(err.message).toBe('Daily limit reached');
    expect(err.name).toBe('AppError');
  });

  it('is a real Error (stack, instanceof, throw/catch semantics)', () => {
    const err = new AppError({
      code: 'VALIDATION_FAILED',
      message: 'Invalid input',
      statusCode: 400,
    });

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.stack).toEqual(expect.any(String));

    expect(() => {
      throw err;
    }).toThrow(AppError);

    expect(() => {
      throw err;
    }).toThrow('Invalid input');
  });

  it('isolates overlapping messages so routing by code/status stays unambiguous', () => {
    const limit = new AppError({
      code: 'LIMIT_EXCEEDED',
      message: 'Bad request',
      statusCode: 429,
    });
    const validation = new AppError({
      code: 'VALIDATION_FAILED',
      message: 'Bad request',
      statusCode: 400,
    });

    expect(limit.message).toBe(validation.message);
    expect(limit.code).not.toBe(validation.code);
    expect(limit.statusCode).not.toBe(validation.statusCode);
  });
});
