import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateAccountModel {
  @IsNotEmpty()
  @IsString()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
  @IsOptional()
  @IsNumber()
  role?: number;
  @IsOptional()
  @IsBoolean()
  verify?: boolean;
}
