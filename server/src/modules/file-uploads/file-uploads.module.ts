import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadsController } from './file-uploads.controller';
import { FileUploadsService } from './file-uploads.service';
import { FileUpload } from './file-uploads.entity';
import { Prompt } from '../prompts/prompt.entity';
import { GoogleDriveService } from './google-drive.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileUpload, Prompt])],
  controllers: [FileUploadsController],
  providers: [FileUploadsService, GoogleDriveService],
  exports: [FileUploadsService],
})
export class FileUploadsModule {}
