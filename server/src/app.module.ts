import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { PromptModule } from './modules/prompt/prompt.module';
import { CustomizeUiModule } from './modules/customize-ui/customize-ui.module';
import { FilesModule } from './modules/files/files.module';

@Module({
  imports: [UsersModule, AuthenticationModule, PromptModule, CustomizeUiModule, FilesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
