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
import { AccountRepository } from './authentication.respository';
import { CreateAccountModel } from './dto/account.create.model';
import { BlacklistService } from '../blacklist/blacklist.service';
import { AccountRegisterModel } from './dto/account.register.model';
import { CreateTokenModel } from '../token/dto/token.create.model';
import { UseRegisterModel } from './dto/user.create.model';
import { plainToClass } from 'class-transformer';
import axios from 'axios';
require('dotenv').config();

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly accountRepository: AccountRepository,
    private readonly blacklistService: BlacklistService,
  ) {}
  public async register(accountInfo: AccountRegisterModel) {
    const user = await this.accountRepository.getByEmail(accountInfo.email);
    if (user) {
      throw new BadRequestException('email is existed');
    }
    const accountData: CreateAccountModel = {
      email: accountInfo.email,
      password: await this.hashPassword(accountInfo.password),
      role: accountInfo.role_id,
    };
    const addAccount = await this.accountRepository.add(accountData);

    if (addAccount) {
      const token = await this.login({
        email: accountInfo.email,
        password: accountInfo.password,
      });
      const userInfo = plainToClass(UseRegisterModel, accountInfo);
      userInfo.account_id = addAccount.dataValues?.id;
      try {
        const response = await axios.post(
          `${process.env.PORTAL_URL}/users`,
          userInfo,
          {
            headers: {
              Authorization: `Bearer ${token.access_token}`, // Add the token here
            },
          },
        );
        console.log(response);
        if (response.status === 201) {
          return userInfo;
        }
        return null;
      } catch (e) {
        await this.accountRepository.deleteById(addAccount.dataValues?.id);
        console.log(e);
        return null;
      }
    }
    return addAccount;
  }
  public async login(loginRequest: LoginRequest): Promise<TokensResponseModel> {
    const user = await this.accountRepository.getByEmail(loginRequest.email);
    if (!user) {
      throw new NotFoundException('email not found');
    }
    const blackAccount =
      await this.blacklistService.checkBlacklistAccountByAccountId(user.id);
    if (blackAccount) {
      throw new BadRequestException('This account is blocked');
    }
    const comparePasswords = await this.comparePasswords(
      loginRequest.password,
      user.password,
    );
    if (!comparePasswords) {
      throw new BadRequestException('Password wrong');
    }
    const payload: PayloadModel = {
      accountId: user.id,
      role: user.role,
    };

    // 15 minute expired
    const expiredTime = 15 * 60 * 1000;
    // 30 day expired refresh token
    const expiredRefreshToken = 30 * 24 * 60 * 60 * 1000;
    const result: TokensResponseModel = {
      access_token: this.tokenService.renderToken(payload, expiredTime),
      refresh_token: this.tokenService.renderToken(
        payload,
        expiredRefreshToken,
      ),
      expired_time: Date.now() + expiredTime,
      role: user.role,
    };
    const token: CreateTokenModel = {
      account_id: user.id,
      refresh_token: result.refresh_token,
      expiredAt: Date.now() + expiredTime,
    };
    const addToken = this.tokenService.addToken(token);
    if (!addToken) {
      throw new NotFoundException('Saved Token Failed');
    }
    return result;
  }
  public async refreshToken(refresh_token: string) {
    const refreshTokenResult = this.tokenService.refreshToken(refresh_token);
    return refreshTokenResult;
  }
  public async validateToken(token: string) {
    const decoded = this.tokenService.decodeToken(token);
    return decoded ?? null;
  }
  public async logout(token: string) {
    const decoded = this.tokenService.decodeToken(token);
    if (!decoded) return null;
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
