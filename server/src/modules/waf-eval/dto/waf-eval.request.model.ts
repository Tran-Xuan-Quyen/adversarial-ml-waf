import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class WafEvalRequestModel {
  @ApiProperty({ description: 'Raw query payload to score (SQLi / transform string)' })
  @IsString()
  @IsNotEmpty()
  payload: string;
}
