import {
  IsString,
  IsInt,
  IsOptional,
  IsUrl,
  IsPhoneNumber,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class UserUpdateModel {
  @IsOptional()
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

  @IsOptional()
  @IsInt()
  status_id: number;

  @IsOptional()
  @IsInt()
  role_id: number;
}
