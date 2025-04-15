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

export class UseRegisterModel {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsUUID()
  account_id: string;

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

  @IsOptional()
  @IsString()
  information?: string;

  @IsNotEmpty()
  @IsInt()
  role_id: number;
}
