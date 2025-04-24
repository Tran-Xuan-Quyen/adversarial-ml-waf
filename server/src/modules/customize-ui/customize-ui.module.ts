import { Module } from '@nestjs/common';
import { CustomizeUiController } from './customize-ui.controller';
import { CustomizeUiService } from './customize-ui.service';

@Module({
  controllers: [CustomizeUiController],
  providers: [CustomizeUiService]
})
export class CustomizeUiModule {}
