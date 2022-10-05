import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSalesContractreviewDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'LoanID'
  })
  loanid: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Businessborrower Flag.',
    example: 'Y'
  })
  businessborrower: string;

  @ApiProperty({
    description: 'Businessowner Flag.',
    example: 'Y'
  })
  businessowner: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Project Site Address Flag.',
    example: 'Y'
  })
  projectsiteaddress: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Loan Amount Flag.',
    example: 'Y'
  })
  loanamount: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Module Manufacturer Flag.',
    example: 'Y'
  })
  modulemanufacturer: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Inverter Manufacturer Flag.',
    example: 'Y'
  })
  invertermanufacturer: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Battery Manufacturer Flag.',
    example: 'Y'
  })
  batterymanufacturer: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Signature check Flag.',
    example: 'Y'
  })
  signaturecheck: string;

  @ApiProperty({
    description: 'Status.',
    example: 'Y'
  })
  status: string;
}
