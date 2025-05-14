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

export class UserCreateModel {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsInt()
  gender?: number;

  @IsOptional()
  @IsDateString()
  birth?: bigint;

  @IsOptional()
  @IsPhoneNumber('VN')
  phone_number?: string;

  @IsOptional()
  @IsUrl()
  image?: string;

  @IsNotEmpty()
  @IsInt()
  status_id: number;

  @IsNotEmpty()
  @IsInt()
  role_id: number;
}
