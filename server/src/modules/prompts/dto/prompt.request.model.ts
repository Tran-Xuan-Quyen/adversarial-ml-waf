import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PromptRequestModel {
  @ApiProperty({
    description: 'The name of the prompt',
    example: 'Prompt 1',
  })
  @IsNotEmpty()
  @IsString()
  promptName: string;

  @ApiProperty({
    description: 'The project id of the prompt',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  projectId: number;

  @ApiProperty({
    description: 'The status of the prompt',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  promptStatus: number;
}
