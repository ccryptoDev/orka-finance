import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsEmail,
} from 'class-validator';
export class StartApplicationFormDto {
  loanId: string;

  @IsNotEmpty()
  @IsEmail()
  businessEmail: string;

  @IsNotEmpty()
  @IsString()
  businessLegalName: string;

  //applicant legal name is removed from credit app mapping this to owner firstName in all service
  // applicantLegalName: string;

  applicantFirstName: string;

  applicantLastName: string;

  businessPhone: string;

  businessAddress: string;

  businessCity: string;

  businessState: string;

  businessZip: string;

  installerId: string;

  installerName: string;
}
