import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUpload } from './file-uploads.entity';
import { FileUploadsRequestModel } from './dto/file-uploads.request.model';
import { Prompt } from '../prompts/prompt.entity';
import { GoogleDriveService } from './google-drive.service';

@Injectable()
export class FileUploadsService {
  constructor(
    @InjectRepository(FileUpload)
    private fileUploadRepository: Repository<FileUpload>,
    @InjectRepository(Prompt)
    private promptRepository: Repository<Prompt>,
    private googleDriveService: GoogleDriveService,
  ) {}

  async uploadFile(body: FileUploadsRequestModel, file: Express.Multer.File) {
    try {
      const prompt = await this.promptRepository.findOne({
        where: { id: +body.promptId },
      });

      if (!prompt) {
        throw new NotFoundException(
          `Prompt with id ${body.promptId} not found`,
        );
      }

      const filePath = await this.googleDriveService.uploadFile(file);

      const fileUpload = new FileUpload();
      fileUpload.fileName = file.originalname;
      fileUpload.fileSize = file.size;
      fileUpload.promptId = +body.promptId;
      fileUpload.status = 'pending';
      fileUpload.createdAt = new Date();
      fileUpload.updatedAt = new Date();
      fileUpload.filePath = filePath;
      await this.fileUploadRepository.save(fileUpload);
      return fileUpload;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to upload file with error: ${error.message}`);
    }
  }

  async getFileUploadsByPromptId(promptId: string) {
    try {
      const prompt = await this.promptRepository.findOne({
        where: { id: +promptId },
      });

      if (!prompt) {
        throw new NotFoundException(`Prompt with id ${promptId} not found`);
      }
      return this.fileUploadRepository.find({
        where: { promptId: +promptId },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to get file uploads with error: ${error.message}`,
      );
    }
  }

  async deleteFileUpload(id: string) {
    try {
      const deleteResult = await this.fileUploadRepository.delete(id);

      if (deleteResult.affected === 0) {
        throw new BadRequestException(`Failed to delete prompt with ID ${id}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to delete file upload with error: ${error.message}`,
      );
    }
  }
}
