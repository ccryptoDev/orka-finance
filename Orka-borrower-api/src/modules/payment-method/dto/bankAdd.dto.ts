import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class bankAddDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Bank Name.',
    example: 'Test bank',
  })
  bankName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'BankHolder Name.',
    example: 'Test user',
  })
  holderName: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'routingNumber.',
    example: '12345',
  })
  routingNumber: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'accountNumber.',
    example: '4565656265656',
  })
  accountNumber: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'user_id.',
    example: 'f15e1e4f5e4f54e5fe',
  })
  user_id: string;
}