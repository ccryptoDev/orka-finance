import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentScheduler {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'loan_id.',
    example: 'f15e1e4f5e4f54e5fe',
  })
  loanId: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'unpaidPrincipal.',
    example: '10000',
  })
  unpaidPrincipal: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'principal.',
    example: '10000',
  })
  principal: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'interest.',
    example: '12',
  })
  interest: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'fees.',
    example: '100',
  })
  fees: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'amount.',
    example: '470',
  })
  amount: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'scheduleDate.',
    example: '2021-07-14',
  })
  scheduleDate: string;
}
