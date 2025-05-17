import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ProjectsCreateModel {
  @IsNotEmpty()
  @IsString()
  projectName: string;

  @IsNotEmpty()
  @IsString()
  applicationDomain: string;

  @IsOptional()
  @IsString()
  description: string;
}
