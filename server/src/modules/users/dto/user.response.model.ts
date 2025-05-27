import { Role } from '../../roles/role.entity';
import { Project } from '../../projects/projects.entity';
import { AccessLog } from '../../access-logs/access-logs.entity';
import { Token } from '../../token/token.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ProjectsResponseModel } from '../../projects/dto/projects.response.model';
// import { RoleResponseModel } from '../../roles/dto/roles.response.model';

@Exclude()
export class UserResponseModel {
  @Expose()
  @ApiProperty({
    example: 1,
    description: 'ID của user',
  })
  id: number;

  @Expose()
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email của user',
  })
  email: string;

  @Expose()
  @ApiProperty({
    example: 'John Doe',
    description: 'Tên đầy đủ của user',
  })
  fullName: string;

  @Expose()
  @ApiProperty({
    example: 'avatar.jpg',
    description: 'Avatar của user',
  })
  image: string;

  @Expose()
  @ApiProperty({
    example: 'active',
    description: 'Trạng thái của user',
  })
  statusId: string;

  @Expose()
  @ApiProperty({
    example: 'Name',
    description: 'Giới tính của user',
  })
  gender: string;

  @Expose()
  @ApiProperty({
    example: '2024-03-20T10:00:00Z',
    description: 'Ngày sinh của user',
  })
  birth: Date;

  @Expose()
  @ApiProperty({
    example: '0909090909',
    description: 'Số điện thoại của user',
  })
  phoneNumber: string;

  @Expose()
  @ApiProperty({
    example: '2024-03-20T10:00:00Z',
    description: 'Thời gian tạo user',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    example: '2024-03-20T10:00:00Z',
    description: 'Thời gian cập nhật user',
  })
  updatedAt: Date;

  // @Expose()
  // @Type(() => RoleResponseModel)
  // @ApiProperty({ type: () => RoleResponseModel })
  // role: RoleResponseModel;

  @Expose()
  @Type(() => ProjectsResponseModel)
  @ApiProperty({ type: () => [ProjectsResponseModel] })
  projects: ProjectsResponseModel[];

  @Expose()
  @Type(() => String)
  @ApiProperty({
    type: String,
    description: 'password của user',
  })
  passwordHash: string;

  @Expose()
  accessLogs?: AccessLog[];

  @Expose()
  tokens?: Token[];
}
