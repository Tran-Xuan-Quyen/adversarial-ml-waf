import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { RolesModule } from './modules/roles/roles.module';
import { AccessLogsModule } from './modules/access-logs/access-logs.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { DomainsModule } from './modules/domains/domains.module';
import { BotConfiguarationsModule } from './modules/bot-configurations/bot-configuarations.module';
import { FileUploadsModule } from './modules/file-uploads/file-uploads.module';
import { RsaKeyModule } from './modules/rsa_key/rsa_key.module';
import { PromptsModule } from './modules/prompts/prompts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        ssl: {
          rejectUnauthorized: false
        }
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthenticationModule,
    RolesModule,
    AccessLogsModule,
    ProjectsModule,
    DomainsModule,
    BotConfiguarationsModule,
    FileUploadsModule,
    RsaKeyModule,
    PromptsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
