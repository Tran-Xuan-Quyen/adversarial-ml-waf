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
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
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
  public async login(loginRequest: LoginRequest): Promise<TokensResponseModel> {
    const user = await this.usersService.findByEmail(loginRequest.email);
    if (!user) {
      throw new NotFoundException('email not found');
    }
    const comparePasswords = await this.comparePasswords(
      loginRequest.password,
      user.passwordHash,
    );
    if (!comparePasswords) {
      throw new BadRequestException('Password wrong');
    }
    const payload: PayloadModel = {
      userId: user.id,
      role: user.roleId
    };

    // 15 minute expired
    const expiredTime = 15 * 60 * 1000;
    // 30 day expired refresh token
    const expiredRefreshToken = 30 * 24 * 60 * 60 * 1000;
    const result: TokensResponseModel = {
      accessToken: this.tokenService.renderToken(payload, expiredTime),
      refreshToken: this.tokenService.renderToken(
        payload,
        expiredRefreshToken,
      ),
      expiredTime: Date.now() + expiredTime,
      role: user.roleId,
    };
    const token: CreateTokenModel = {
      userId: user.id,
      refreshToken: result.refreshToken,
      expiredAt: Date.now() + expiredTime,
    };
    const addToken = this.tokenService.addToken(token);
    if (!addToken) {
      throw new NotFoundException('Saved Token Failed');
    }
    return result;
  }
  
  public async refreshToken(refresh_token: string) {
    return await this.tokenService.refreshToken(refresh_token);
  }
  public validateToken(token: string)  {
    return this.tokenService.decodeToken(token);
  }
  public async logout(token: string) {
    const decoded = this.tokenService.decodeToken(token);
    if (!decoded) return null;
    return await this.tokenService.setExpiredToken(token);
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
