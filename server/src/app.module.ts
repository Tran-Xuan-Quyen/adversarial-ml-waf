import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthenticationModule } from './module/authentication/authentication.module';

import { RsaKeyModule } from './module/rsa_key/rsa_key.module';
import { TokenModule } from './module/token/token.module';
import { AccountModel } from './entities/account.model';
import { TokenModel } from './entities/token.model';
import { BlacklistModel } from './entities/blacklist.model';
import { WhiteListModel } from './entities/whitelist.model';
import { ServiceModel } from './entities/service.model';
import { BlacklistModule } from './module/blacklist/blacklist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Load file cấu hình database
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql', // Kiểu cơ sở dữ liệu (MySQL)
        host: configService.get<string>('DB_HOST'), // Lấy host từ biến môi trường
        port: configService.get<number>('DB_PORT'), // Port dạng số
        username: configService.get<string>('DB_USER'), // Tên người dùng MySQL
        password: configService.get<string>('DB_PASSWORD'), // Mật khẩu MySQL
        database: configService.get<string>('DB_NAME'), // Tên cơ sở dữ liệu
        models: [
          AccountModel,
          ServiceModel,
          TokenModel,
          BlacklistModel,
          WhiteListModel,
        ], // Đăng ký model Sequelize
        autoLoadModels: true, // Tự động tạo bảng nếu chưa có
        synchronize: true, // Đồng bộ hóa model với cơ sở dữ liệu
      }),
    }),
    RsaKeyModule,
    TokenModule,
    AuthenticationModule,
    BlacklistModule,
  ],
  providers: [AppService],
})
export class AppModule {}
