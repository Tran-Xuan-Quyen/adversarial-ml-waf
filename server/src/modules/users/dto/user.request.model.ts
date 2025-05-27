import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsUrl,
  IsPhoneNumber,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserRequestModel {
  @ApiProperty({
    description: 'The username of the user',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: 'The password hash of the user',
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsString()
  passwordHash: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'test1234@example.com',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'The gender of the user',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  gender?: number;

  @ApiProperty({
    description: 'The birth of the user',
    example: '2021-01-01',
  })
  @IsOptional()
  @IsDateString()
  birth?: bigint;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '+84909123456',
  })
  @IsOptional()
  @IsPhoneNumber('VN')
  phone_number?: string;

  @ApiProperty({
    description: 'The image of the user',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiProperty({
    description: 'The status id of the user',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  status_id: number;

  @ApiProperty({
    description: 'The role id of the user',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  role_id: number;
}
