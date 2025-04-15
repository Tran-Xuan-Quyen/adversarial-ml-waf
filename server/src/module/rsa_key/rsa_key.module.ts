import { Module } from '@nestjs/common';
import { RsaKeyService } from './rsa_key.service';

@Module({
  providers: [RsaKeyService],
})
export class RsaKeyModule {}
