import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ProjectsResponseModel } from 'src/modules/projects/dto/projects.response.model';

@Exclude()
export class PromptResponseModel {
  @ApiProperty({
    example: 1,
    description: 'The id of the prompt',
  })
  @Expose()
  id: number;

  @ApiProperty({
    example: 'Prompt 1',
    description: 'The name of the prompt',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: 1,
    description: 'The id of the project',
  })
  @Expose()
  projectId: number;

  @ApiProperty({
    example: 1,
    description: 'The status of the prompt',
  })
  @Expose()
  status: number;

  @ApiProperty({
    example: '2021-01-01',
    description: 'The created at of the prompt',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2021-01-01',
    description: 'The updated at of the prompt',
  })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    example: '2021-01-01',
    description: 'The deleted at of the prompt',
  })
  @Expose()
  deletedAt: Date;

  @Expose()
  @Type(() => ProjectsResponseModel)
  @ApiProperty({ type: () => [ProjectsResponseModel] })
  project: ProjectsResponseModel;
}
