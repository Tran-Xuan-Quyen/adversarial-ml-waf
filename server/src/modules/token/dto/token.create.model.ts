import { IsOptional, IsString, IsNotEmpty, IsDate } from 'class-validator';
export class CreateTokenModel {
  @IsNotEmpty()
  @IsString()
  userId: number;
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
  @IsOptional()
  @IsDate()
  expiredAt?: number;
  @IsOptional()
  @IsDate()
  isExpired?: boolean;
}
