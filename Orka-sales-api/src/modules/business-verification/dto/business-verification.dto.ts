import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsEmail,
} from 'class-validator';

export class BusinessVerificationFormDto {
  @IsString()
  @IsNotEmpty()
  loanId: string;

  @IsString()
  @IsNotEmpty()
  taxId: string;

  @IsString()
  @IsNotEmpty()
  businessIndustry: string;

  @IsString()
  @IsNotEmpty()
  businessBipocowned: string;

  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  empContractCount: string;

  @IsString()
  @IsNotEmpty()
  businessPhone: string;

  // @IsString()
  // @IsNotEmpty()
  // applicantLegalName: string;

  @IsString()
  @IsNotEmpty()
  businessAddress: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  // @IsString()
  // @IsNotEmpty()
  // yearOfOwnership: string;

  @IsString()
  @IsNotEmpty()
  businessStructure: string;

  @IsString()
  @IsNotEmpty()
  lastYearRevenue: string;

  @IsNotEmpty()
  @IsString()
  taxExempt: string;

  taxExemptNumber: string;

  certifyuseofloan: string;

  services: string; // This is not coming from entity only for upload files
}
