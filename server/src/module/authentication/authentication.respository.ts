import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AccountModel } from 'src/entities/account.model';
import { CreateAccountModel } from './dto/account.create.model';
import { plainToClass } from 'class-transformer';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectModel(AccountModel)
    private accountModel: typeof AccountModel,
  ) {}

  async getById(id: string): Promise<AccountModel> {
    return await this.accountModel.findOne({ where: { id: id } });
  }
  async add(account: CreateAccountModel) {
    const accountInfo = plainToClass(AccountModel, account);
    return await this.accountModel.create(accountInfo?.dataValues);
  }
  async getByEmail(email: string): Promise<AccountModel> {
    return await this.accountModel.findOne({ where: { email: email } });
  }
  async updateById(id: string, account: CreateAccountModel) {
    return await this.accountModel.update(
      {
        email: account.email,
        password: account.password,
        verify: account?.verify ?? false,
        role: account?.role ?? 0,
      },
      {
        where: {
          id: id,
        },
      },
    );
  }
  async deleteById(id: string) {
    return await this.accountModel.destroy({
      where: {
        id: id,
      },
    });
  }
}
