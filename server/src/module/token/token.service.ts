import { Injectable } from '@nestjs/common';
import { TokenRepository } from './token.repository';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { PayloadModel } from './dto/payload.model';
import { TokensResponseModel } from './dto/tokens.response.model';
import { CreateTokenModel } from './dto/token.create.model';

@Injectable()
export class TokenService {
  private privateKey: Buffer;
  private publicKey: Buffer;
  constructor(private readonly tokenRepository: TokenRepository) {
    this.privateKey = fs.readFileSync('key/private-key.pem');
    this.publicKey = fs.readFileSync('key/public-key.pem');
  }

  public renderToken(payload: PayloadModel, expiredTime: number): string {
    const expiredAt = Math.floor(expiredTime / 1000);
    const token = jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: expiredAt,
    });
    return token;
  }
  public renderTokenPair(payload: PayloadModel): TokensResponseModel {
    // 60 minute expired
    const expiredTime = 60 * 60 * 1000;
    // 30 day expired refresh token
    const expiredRefreshToken = 30 * 24 * 60 * 60 * 1000;
    const result: TokensResponseModel = {
      access_token: this.renderToken(payload, expiredTime),
      refresh_token: this.renderToken(payload, expiredRefreshToken),
    };
    return result;
  }
  public decodeToken(token: string): any {
    const decoded = jwt.verify(
      token,
      this.publicKey,
      { algorithms: ['RS256'] },
      (err, decoded) => {
        if (err) {
          console.error('Token is invalid or expired:', err.message);
          return null;
        } else {
          return decoded;
        }
      },
    );
    return decoded;
  }
  public async refreshToken(token: string): Promise<TokensResponseModel> {
    const decoded = this.decodeToken(token);
    if (!decoded) return null;
    const refreshTokens = await this.tokenRepository.getExpiredTokenByAccountId(
      decoded?.accountId,
    );
    if (refreshTokens.length != 0) {
      return null;
    }
    const payload: PayloadModel = {
      accountId: decoded.accountId,
      role: decoded.role,
    };
    const tokenPair = this.renderTokenPair(payload);
    console.log(tokenPair);
    const addTokenResult = await this.addToken({
      account_id: payload.accountId,
      refresh_token: tokenPair.refresh_token,
    });
    if (!addTokenResult) return null;
    return tokenPair;
  }
  public async addToken(refreshToken: CreateTokenModel): Promise<boolean> {
    refreshToken.isExpired = false;
    const addTokenResult = this.tokenRepository.add(refreshToken);
    if (!addTokenResult) return false;
    return true;
  }
  public async setExpiredToken(refreshToken: string): Promise<boolean> {
    const setExpiredToken =
      this.tokenRepository.setExpiredTokenByAccountId(refreshToken);
    if (!setExpiredToken) return false;
    return true;
  }
}
