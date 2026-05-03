export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenHash: string;
  refreshTokenExpiresAt: Date;
}

export interface AccessTokenPayload {
  userId: string;
}

export interface TokenService {
  issueTokens(userId: string): Promise<IssuedTokens>;
  hashRefreshToken(refreshToken: string): Promise<string>;
  verifyAccessToken(token: string): Promise<AccessTokenPayload>;
}
