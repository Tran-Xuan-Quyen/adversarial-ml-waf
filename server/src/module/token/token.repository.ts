import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TokenModel } from 'src/entities/token.model';
import { CreateTokenModel } from './dto/token.create.model';
import { plainToClass } from 'class-transformer';

@Injectable()
export class TokenRepository {
  constructor(
    @InjectModel(TokenModel)
    private tokenModel: typeof TokenModel,
  ) {}

  async add(token: CreateTokenModel) {
    const result = plainToClass(TokenModel, token);
    return await this.tokenModel.create(result?.dataValues);
  }
  async getExpiredTokenByAccountId(account_id: string) {
    return await this.tokenModel.findAll({
      where: {
        account_id: account_id,
        is_expired: true,
      },
    });
  }
  async getExpiredTokenByToken(refresh_token: string) {
    return await this.tokenModel.findOne({
      where: {
        refresh_token: refresh_token,
        is_expired: true,
      },
    });
  }
  async getTokenByAccountId(account_id: string): Promise<TokenModel[]> {
    return await this.tokenModel.findAll({
      where: {
        account_id: account_id,
      },
    });
  }
  async getTokenByRefreshToken(token: string) {
    return await this.tokenModel.findAll({
      where: {
        refresh_token: token,
      },
    });
  }
  async setExpiredTokenByAccountId(accountId: string) {
    return await this.tokenModel.update(
      {
        is_expired: true,
      },
      {
        where: {
          expired_at: false,
          account_id: accountId,
        },
      },
    );
  }
  async setExpiredTokenByRefreshToken(refreshToken: string) {
    return await this.tokenModel.update(
      {
        is_expired: true,
        expired_at: new Date(),
      },
      {
        where: {
          refresh_token: refreshToken,
        },
      },
    );
  }
}
