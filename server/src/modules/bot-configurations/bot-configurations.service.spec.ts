import { Test, TestingModule } from '@nestjs/testing';
import { BotConfigurationsService } from './bot-configurations.service';

describe('BotConfigurationsService', () => {
  let service: BotConfigurationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BotConfigurationsService],
    }).compile();

    service = module.get<BotConfigurationsService>(BotConfigurationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
