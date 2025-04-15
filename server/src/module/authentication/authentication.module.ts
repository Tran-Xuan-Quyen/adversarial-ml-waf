import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { TokenModule } from '../token/token.module';
import { AccountRepository } from './authentication.respository';
import { SequelizeModule } from '@nestjs/sequelize';
import { AccountModel } from 'src/entities/account.model';
import { BlacklistModule } from '../blacklist/blacklist.module';

@Module({
  imports: [
    TokenModule,
    BlacklistModule,
    SequelizeModule.forFeature([AccountModel]),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, AccountRepository],
})
export class AuthenticationModule {}
