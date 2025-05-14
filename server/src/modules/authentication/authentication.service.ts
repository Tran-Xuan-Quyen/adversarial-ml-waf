/* eslint-disable @typescript-eslint/no-require-imports */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PayloadModel } from '../token/dto/payload.model';
import * as bcrypt from 'bcrypt';
import { LoginRequest } from './dto/login.request.model';
import { TokensResponseModel } from '../token/dto/tokens.response.model';
import { TokenService } from '../token/token.service';
import { CreateTokenModel } from '../token/dto/token.create.model';
import { plainToClass } from 'class-transformer';
require('dotenv').config();

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly tokenService: TokenService,
  ) {}
  // public async register(accountInfo: AccountRegisterModel) {
  //   const user = await this.authenticationRepository.getByEmail(accountInfo.email);
  //   if (user) {
  //     throw new BadRequestException('email is existed');
  //   }
  //   const accountData: CreateAccountModel = {
  //     email: accountInfo.email,
  //     password: await this.hashPassword(accountInfo.password),
  //     role: accountInfo.role_id,
  //   };
  //   const newUser = await this.authenticationRepository.add(accountData);
  //   if (!newUser) {
  //     throw new BadRequestException('Failed to create user');
  //   }
  //   const token = await this.login({
  //     email: accountInfo.email,
  //     password: accountInfo.password,
  //   });
    
  // }
  // public async login(loginRequest: LoginRequest): Promise<TokensResponseModel> {
  //   const user = await this.accountRepository.getByEmail(loginRequest.email);
  //   if (!user) {
  //     throw new NotFoundException('email not found');
  //   }
  //   const comparePasswords = await this.comparePasswords(
  //     loginRequest.password,
  //     user.passwordHash,
  //   );
  //   if (!comparePasswords) {
  //     throw new BadRequestException('Password wrong');
  //   }
  //   const payload: PayloadModel = {
  //     accountId: user.id,
  //     role: user.roleId,
  //   };

  //   // 15 minute expired
  //   const expiredTime = 15 * 60 * 1000;
  //   // 30 day expired refresh token
  //   const expiredRefreshToken = 30 * 24 * 60 * 60 * 1000;
  //   const result: TokensResponseModel = {
  //     access_token: this.tokenService.renderToken(payload, expiredTime),
  //     refresh_token: this.tokenService.renderToken(
  //       payload,
  //       expiredRefreshToken,
  //     ),
  //     expired_time: Date.now() + expiredTime,
  //     role: user.roleId,
  //   };
  //   const token: CreateTokenModel = {
  //     account_id: user.id,
  //     refresh_token: result.refresh_token,
  //     expiredAt: Date.now() + expiredTime,
  //   };
  //   const addToken = await this.tokenService.addToken(token);
  //   if (!addToken) {
  //     throw new NotFoundException('Saved Token Failed');
  //   }
  //   return result;
  // }
  // public async refreshToken(refresh_token: string) {
  //   return await this.tokenService.refreshToken(refresh_token);
  // }
  public async validateToken(token: string) {
    return await this.tokenService.decodeToken(token);
  }
  public async logout(token: string) {
    const decoded = await this.tokenService.decodeToken(token);
    if (!decoded) return null;
    return await this.tokenService.setExpiredToken(token);
  }
  public async refreshToken(refresh_token: string) {
    const refreshTokenResult = this.tokenService.refreshToken(refresh_token);
    return refreshTokenResult;
  }
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
  private async comparePasswords(
    password: string,
    storedPasswordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, storedPasswordHash);
  }
}
