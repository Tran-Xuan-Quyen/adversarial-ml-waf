import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DecodeTokenRequest {
  @ApiProperty()
  @IsNotEmpty()
  token: string;
}
