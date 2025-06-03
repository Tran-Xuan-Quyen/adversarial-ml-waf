import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadsService } from './file-uploads.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadsRequestModel } from './dto/file-uploads.request.model';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { FileUploadsResponseModel } from './dto/file-uploads.response.model';
import { plainToInstance } from 'class-transformer';

@Controller('file-uploads')
export class FileUploadsController {
  constructor(private readonly fileUploadsService: FileUploadsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'text/plain',
          'application/pdf',
          'text/csv',
        ];
        if (allowedTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type'), false);
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: FileUploadsRequestModel,
  ) {
    console.log(`[P]:::Uploaded file`, file);
    console.log(`[P]:::Body`, body);
    const fileUploadResponse = await this.fileUploadsService.uploadFile(
      body,
      file,
    );
    let result = plainToInstance(FileUploadsResponseModel, fileUploadResponse);
    return result;
  }

  @Get()
  @ApiOperation({ summary: 'Get all file uploads by prompt ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns all file uploads for a given prompt ID',
    type: FileUploadsResponseModel,
  })
  async getFileUploadsByPromptId(@Query('promptId') promptId: string) {
    console.log(`[P]:::Get all file uploads by prompt ID: ${promptId}`);
    const fileUploads =
      await this.fileUploadsService.getFileUploadsByPromptId(promptId);
    let result = plainToInstance(FileUploadsResponseModel, fileUploads);
    return result;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file upload by ID' })
  @ApiResponse({
    status: 200,
    description: 'The file upload has been successfully deleted.',
  })
  async deleteFileUpload(@Param('id') id: string) {
    console.log(`[P]:::Delete a file upload by ID: ${id}`);
    await this.fileUploadsService.deleteFileUpload(id);
    return { message: 'File upload deleted successfully' };
  }
}
