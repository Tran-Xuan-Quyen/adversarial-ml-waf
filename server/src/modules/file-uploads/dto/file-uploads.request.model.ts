import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FileUploadsRequestModel {
  @ApiProperty({
    description: 'The id of the prompt',
    example: '1',
  })
  @IsNotEmpty()
  promptId: string;
}
