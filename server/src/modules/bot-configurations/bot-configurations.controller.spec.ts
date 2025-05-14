import { Test, TestingModule } from '@nestjs/testing';
import { BotConfigurationsController } from './bot-configurations.controller';

describe('BotConfigurationsController', () => {
  let controller: BotConfigurationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BotConfigurationsController],
    }).compile();

    controller = module.get<BotConfigurationsController>(BotConfigurationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
