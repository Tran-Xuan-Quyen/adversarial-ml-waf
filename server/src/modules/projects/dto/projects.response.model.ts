import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserResponseModel } from 'src/modules/users/dto/user.response.model';

@Exclude()
export class ProjectsResponseModel {
  @ApiProperty({
    example: 1,
    description: 'The id of the project',
  })
  @Expose()
  id: number;

  @ApiProperty({
    example: 'Project 1',
    description: 'The name of the project',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: 'https://example.com',
    description: 'The domain of the project',
  })
  @Expose()
  applicationDomain: string;

  @ApiProperty({
    example: '2021-01-01',
    description: 'The created at of the project',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2021-01-01',
    description: 'The updated at of the project',
  })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    example: '2021-01-01',
    description: 'The deleted at of the project',
  })
  @Expose()
  deletedAt: Date;

  @Expose()
  @Type(() => UserResponseModel)
  @ApiProperty({ type: () => [UserResponseModel] })
  users: UserResponseModel[];
}
