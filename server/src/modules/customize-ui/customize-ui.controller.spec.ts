import { Test, TestingModule } from '@nestjs/testing';
import { CustomizeUiController } from './customize-ui.controller';

describe('CustomizeUiController', () => {
  let controller: CustomizeUiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomizeUiController],
    }).compile();

    controller = module.get<CustomizeUiController>(CustomizeUiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
