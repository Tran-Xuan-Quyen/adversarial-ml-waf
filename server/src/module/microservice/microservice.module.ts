import { Module } from '@nestjs/common';
import { MicroserviceService } from './microservice.service';
import { MicroserviceController } from './microservice.controller';

@Module({
  providers: [MicroserviceService],
  controllers: [MicroserviceController],
})
export class MicroserviceModule {}

// module microservice này dùng để quản lý các public key của tất cả service về sau khi mở rộng hệ thống có thêm nhiều service khác nhau
