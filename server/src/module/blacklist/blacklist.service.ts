import { Injectable } from '@nestjs/common';
import { BlacklistRepository } from './blacklist.repository';
import { BlacklistRequest } from './dto/blacklist.request';
import { BlacklistStatus } from 'src/entities/blacklist.status.enum';

@Injectable()
export class BlacklistService {
  constructor(private readonly blacklistRepository: BlacklistRepository) {}

  public async checkBlacklistAccountByAccountId(
    accountId: string,
  ): Promise<boolean> {
    const account = await this.blacklistRepository.getByAccountId(accountId);

    return account?.status === BlacklistStatus.block ? true : false;
  }
  public async blockAccountByAccountId(account_id: string) {
    const blackAccount: BlacklistRequest = {
      account_id: account_id,
      status: BlacklistStatus.block,
    };
    const addBlackListResult = await this.blacklistRepository.add(blackAccount);
    return addBlackListResult ? true : false;
  }
  public async activeAccountByAccountId(account_id: string): Promise<boolean> {
    const account = await this.blacklistRepository.getByAccountId(account_id);
    if (!account) return false;
    const blacklistAccount: BlacklistRequest = {
      account_id: account.account_id,
      status: BlacklistStatus.active,
    };
    return await this.blacklistRepository.updateByAccountId(blacklistAccount);
  }
}
