import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FileUploadsResponseModel {
  @ApiProperty({
    description: 'The id of the file upload',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'The id of the prompt',
    example: '3',
  })
  @IsNotEmpty()
  @IsNumber()
  promptId: number;

  @ApiProperty({
    description: 'The name of the file upload',
    example: 'file.pdf',
  })
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @ApiProperty({
    description: 'The size of the file upload',
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  fileSize: number;

  @ApiProperty({
    description: 'The status of the file upload',
    example: 'pending',
  })
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiProperty({
    description: 'The created at of the file upload',
    example: '2021-01-01',
  })
  @IsNotEmpty()
  @IsString()
  createdAt: string;

  @ApiProperty({
    description: 'The updated at of the file upload',
    example: '2021-01-01',
  })
  @IsNotEmpty()
  @IsString()
  updatedAt: string;
}
