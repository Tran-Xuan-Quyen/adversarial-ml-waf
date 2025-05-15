import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { Token } from './token.entity';
import { PayloadModel } from './dto/payload.model';
import { TokensResponseModel } from './dto/tokens.response.model';
import { CreateTokenModel } from './dto/token.create.model';

@Injectable()
export class TokenService {
  private privateKey: Buffer;
  private publicKey: Buffer;

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>
  ) {
    this.privateKey = fs.readFileSync('key/private-key.pem');
    this.publicKey = fs.readFileSync('key/public-key.pem');
  }

  public renderToken(payload: PayloadModel, expiredTime: number): string {
    const expiredAt = Math.floor(expiredTime / 1000);
    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: expiredAt,
    });
  }

  public renderTokenPair(payload: PayloadModel): TokensResponseModel {
    const expiredTime = 15 * 60 * 1000; // 15 minutes
    const expiredRefreshToken = 30 * 24 * 60 * 60 * 1000; // 30 days

    return {
      accessToken: this.renderToken(payload, expiredTime),
      refreshToken: this.renderToken(payload, expiredRefreshToken),
      expiredTime: Date.now() + expiredTime,
      role: payload.role
    };
  }

  public decodeToken(token: string){
    try {
      return jwt.verify(token, this.publicKey, { algorithms: ['RS256'] });
    } catch (error) {
      console.error('Token is invalid or expired:', error.message);
      return null;
    }
  }

  public async refreshToken(token: string,expiredTime?: number): Promise<TokensResponseModel | null> {
    const decoded = this.decodeToken(token);
    if (!decoded) return null;

    const existingToken = await this.tokenRepository.findOne({
      where: { 
        refreshToken: token,
      }
    });

    if (!existingToken) return null;

    const payload: PayloadModel = {
      userId: decoded.userId,
      role: decoded.role
    };

    const tokenPair = this.renderTokenPair(payload);
    
    const addTokenResult = await this.addToken({
      userId: payload.userId,
      refreshToken: tokenPair.refreshToken,
      expiredAt: Date.now() + 15 * 60 * 1000
    });

    if (!addTokenResult) return null;
    return tokenPair;
  }

  public async addToken(tokenData: CreateTokenModel): Promise<boolean> {
    try {
      const token = this.tokenRepository.create({
        userId: tokenData.userId,
        refreshToken: tokenData.refreshToken,
        expiredAt: new Date(tokenData.expiredAt ?? Date.now() + 15 * 60 * 1000)
      });
      await this.tokenRepository.save(token);
      return true;
    } catch (error) {
      console.error('Failed to add token:', error);
      return false;
    }
  }

  public async setExpiredToken(refreshToken: string): Promise<boolean> {
    try {
      const result = await this.tokenRepository.update(
        { refreshToken },
        { expiredAt: new Date() }
      );
      return (result.affected ?? 0) > 0;
    } catch (error) {
      console.error('Failed to set token as expired:', error);
      return false;
    }
  }
}
