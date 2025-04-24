import { Test, TestingModule } from '@nestjs/testing';
import { CustomizeUiService } from './customize-ui.service';

describe('CustomizeUiService', () => {
  let service: CustomizeUiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomizeUiService],
    }).compile();

    service = module.get<CustomizeUiService>(CustomizeUiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
