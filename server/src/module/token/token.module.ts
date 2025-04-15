import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenRepository } from './token.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { TokenModel } from 'src/entities/token.model';

@Module({
  imports: [SequelizeModule.forFeature([TokenModel])],
  providers: [TokenService, TokenRepository],
  exports: [TokenService],
})
export class TokenModule {}
