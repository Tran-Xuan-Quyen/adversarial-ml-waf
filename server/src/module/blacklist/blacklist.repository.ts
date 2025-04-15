import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { plainToClass } from 'class-transformer';
import { BlacklistModel } from 'src/entities/blacklist.model';
import { BlacklistResponse } from './dto/blacklist.response';
import { BlacklistRequest } from './dto/blacklist.request';

@Injectable()
export class BlacklistRepository {
  constructor(
    @InjectModel(BlacklistModel)
    private blacklistModel: typeof BlacklistModel,
  ) {}
  async getByAccountId(accountId: string): Promise<BlacklistResponse> {
    const blacklist = await this.blacklistModel.findOne({
      where: {
        account_id: accountId,
      },
    });
    const result = plainToClass(BlacklistResponse, blacklist);
    return result;
  }
  async getById(id: string): Promise<BlacklistResponse> {
    const blacklist = await this.blacklistModel.findOne({
      where: {
        id: id,
      },
    });
    const result = plainToClass(BlacklistResponse, blacklist);
    return result;
  }
  async add(blacklist: BlacklistRequest) {
    try {
      const data = plainToClass(BlacklistModel, blacklist);

      return await this.blacklistModel.create(data?.dataValues);
    } catch (err) {
      console.log(err);
    }
  }
  async updateByAccountId(blacklist: BlacklistRequest) {
    try {
      await this.blacklistModel.update(
        {
          status: blacklist.status,
        },
        {
          where: {
            account_id: blacklist.account_id,
          },
        },
      );
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  async deleteByAccountId(accountId: string) {
    return await this.blacklistModel.destroy({
      where: {
        account_id: accountId,
      },
    });
  }
}
