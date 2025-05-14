import { Test, TestingModule } from '@nestjs/testing';
import { RsaKeyService } from './rsa_key.service';

describe('RsaKeyService', () => {
  let service: RsaKeyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RsaKeyService],
    }).compile();

    service = module.get<RsaKeyService>(RsaKeyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
