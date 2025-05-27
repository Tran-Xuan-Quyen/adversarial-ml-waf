import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProjectsRequestModel {
  @ApiProperty({
    description: 'The name of the project',
    example: 'Project 1',
  })
  @IsNotEmpty()
  @IsString()
  projectName: string;

  @ApiProperty({
    description: 'The domain of the project',
    example: 'https://example.com',
  })
  @IsNotEmpty()
  @IsString()
  applicationDomain: string;

  @ApiProperty({
    description: 'The description of the project',
    example: 'This is a description of the project',
  })
  @IsOptional()
  @IsString()
  description: string;
}
