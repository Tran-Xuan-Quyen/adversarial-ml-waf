import { IsOptional, IsString } from 'class-validator';

export class ProjectsUpdateModel {
  @IsOptional()
  @IsString()
  projectName: string;

  @IsOptional()
  @IsString()
  applicationDomain: string;

  @IsOptional()
  @IsString()
  description: string;
}
