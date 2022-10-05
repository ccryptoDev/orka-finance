import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsEmail,
} from 'class-validator';
import { Generated } from 'typeorm';

export class BusinessPrincipalIdentityFormDto {
  @IsString()
  @IsNotEmpty()
  loanId: string;

  @IsString()
  @IsNotEmpty()
  ownerFirstName: string;

  @IsNotEmpty()
  @IsString()
  ownerLastName: string;

  ownerEmail: string;

  @IsNotEmpty()
  @IsString()
  ownerDOB: string;

  @IsString()
  @IsNotEmpty()
  ownerSSN: string;

  @IsNotEmpty()
  @IsString()
  ownerPhone: string;

  @IsNotEmpty()
  @IsString()
  ownerAddress: string;

  @IsNotEmpty()
  @IsString()
  ownerCity: string;

  @IsNotEmpty()
  @IsString()
  ownerState: string;

  @IsNotEmpty()
  @IsString()
  ownerZipCode: string;

  @IsNotEmpty()
  @IsString()
  ownerProfessionalTitle: string;

  // @IsNotEmpty()
  // @IsNumber()
  // ownerAnnualIncome:number;

  @IsNotEmpty()
  @IsString()
  ownerAnnualIncome: string;

  ownerPercentage: string;

  @IsNotEmpty()
  owner2: string;

  @Generated('uuid')
  owner2Id: string;

  owner2FirstName: string;

  owner2LastName: string;

  owner2Email: string;

  owner2DOB: string;

  owner2SSN: string;

  owner2Phone: string;

  owner2Address: string;

  owner2City: string;

  owner2State: string;

  owner2ZipCode: string;

  owner2ProfessionalTitle: string;

  // owner2AnnualIncome: number;
  owner2AnnualIncome: string;

  owner2Percentage: string;

  @IsNotEmpty()
  owner3: string;

  @Generated('uuid')
  owner3Id: string;

  owner3FirstName: string;

  owner3LastName: string;

  owner3Email: string;

  owner3DOB: string;

  owner3SSN: string;

  owner3Phone: string;

  owner3Address: string;

  owner3City: string;

  owner3State: string;

  owner3ZipCode: string;

  owner3ProfessionalTitle: string;

  // owner2AnnualIncome: number;
  owner3AnnualIncome: string;

  owner3Percentage: string;
}
