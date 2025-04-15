import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class BlacklistRequest {
  @ApiProperty({
    description: 'The unique identifier for the device',
    example: '987e6543-a21b-23d5-f456-5566b87741233',
  })
  @IsNotEmpty()
  @IsUUID()
  account_id: string;
  @ApiProperty({
    description: 'The unique identifier for the status',
    example: 1,
  })
  @IsNotEmpty()
  status: number;
}
