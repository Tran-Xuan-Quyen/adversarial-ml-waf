import { Module } from '@nestjs/common';
import { BotConfigurationsController } from './bot-configurations.controller';
import { BotConfigurationsService } from './bot-configurations.service';

@Module({
  controllers: [BotConfigurationsController],
  providers: [BotConfigurationsService]
})
export class BotConfiguarationsModule {}
