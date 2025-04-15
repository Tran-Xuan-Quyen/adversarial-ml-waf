import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsUrl,
  IsPhoneNumber,
  IsDateString,
  IsNumber,
  ValidateIf,
  Min,
} from 'class-validator';

export class AccountRegisterModel {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  email: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;
  @IsOptional()
  @IsNumber()
  @ApiProperty()
  role?: number;

  @ApiProperty({
    description: 'Username for the user',
    example: 'john_doe',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description:
      'Gender of the user, represented by an integer (e.g., 0 for male, 1 for female)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @ValidateIf((o) => o.gender !== '')
  gender?: number;

  @ApiProperty({
    description: 'Birth date of the user in timestamp format',
    example: '1732233600',
  })
  @IsOptional()
  @ValidateIf((o) => o.birth !== null)
  birth?: bigint;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+84901234567',
  })
  @IsOptional()
  @IsPhoneNumber('VN')
  @ValidateIf((o) => o.phone_number !== '')
  phone_number?: string;

  @ApiProperty({
    description: "URL of the user's profile image",
    example: 'https://example.com/images/profile.jpg',
  })
  @IsOptional()
  @IsUrl()
  @ValidateIf((o) => o.image !== '')
  image?: string;

  @ApiProperty({
    description: 'User status ID (e.g., active, suspended)',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  status_id: number;

  @ApiProperty({
    description: 'Additional information about the user',
    example: 'Some bio or information about the user',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.information !== '')
  information?: string;

  @ApiProperty({
    description: 'Role ID associated with the user',
    example: 2,
  })
  @IsNotEmpty()
  @Min(1, { message: 'role should not be empty' })
  role_id: number;
}
