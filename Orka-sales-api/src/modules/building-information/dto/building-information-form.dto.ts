import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsEmail,
} from 'class-validator';

export class BuildingInformationFormDto {
  @IsNotEmpty()
  @IsString()
  loanId: string;

  @IsNotEmpty()
  @IsString()
  businessAddressFlag: string;

  businessInstallAddress: string;

  businessInstallCity: string;

  businessInstallState: string;

  businessInstallZipCode: string;

  @IsNotEmpty()
  @IsString()
  estimatedPropertyValue: string;

  @IsNotEmpty()
  @IsString()
  yearsPropertyOwned: string;

  @IsString()
  @IsNotEmpty()
  ownershipType: string;

  mortageStartDate: string;

  mortageTerm: string;

  monthlyMortagePayment: string;

  lat: string;

  lng: string;
}
