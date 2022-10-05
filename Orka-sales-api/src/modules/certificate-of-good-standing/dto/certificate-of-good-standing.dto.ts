import { IsNotEmpty, IsString } from 'class-validator';

export class CertificateOfGoodStandingDto {
  @IsNotEmpty()
  @IsString()
  loanId: string;
}
