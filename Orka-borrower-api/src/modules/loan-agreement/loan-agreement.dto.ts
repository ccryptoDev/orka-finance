import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class LoanAgreementDto {
  @ValidateIf(o => o.totalAdditionalGuarantor >= 1)
  @IsEmail()
  @ApiProperty({
    description: 'User email',
    example: 'example@test.com',
  })
  guarantySignerEmail1: string;

  @ValidateIf(o => o.totalAdditionalGuarantor > 1)
  @IsEmail()
  @ApiProperty({
    description: 'User email',
    example: 'example@test.com',
  })
  guarantySignerEmail2: string;

  @ValidateIf(o => o.totalAdditionalGuarantor >= 1)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Guarantor Name',
    example: 'Avinash',
  })
  guarantySignerName1: string;

  @ValidateIf(o => o.totalAdditionalGuarantor > 1)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Guarantor Name',
    example: 'Avinash',
  })
  guarantySignerName2: string;

  @IsInt()
  @Max(2)
  @Min(0)
  @ApiProperty({
    description: 'Total Additional Guarantor',
    example: '1',
  })
  totalAdditionalGuarantor: number;
}
