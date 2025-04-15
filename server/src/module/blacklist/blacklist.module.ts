import { Module } from '@nestjs/common';
import { BlacklistService } from './blacklist.service';
import { BlacklistRepository } from './blacklist.repository';
import { BlacklistModel } from 'src/entities/blacklist.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([BlacklistModel])],
  providers: [BlacklistService, BlacklistRepository],
  exports: [BlacklistService],
})
export class BlacklistModule {}
